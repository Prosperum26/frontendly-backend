import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

import { BehaviorEvaluationDto } from '../../dtos/behavior.dto';

const execAsync = promisify(exec);

@Injectable()
export class BehaviorEvaluator {
  private readonly logger = new Logger(BehaviorEvaluator.name);
  private readonly ENCODING = 'utf-8';

  async evaluateBehavior(
    jsxContent: string,
    testScript: string,
  ): Promise<BehaviorEvaluationDto> {
    if (!testScript || testScript.trim() === '') {
      return {
        passed: true,
        totalTests: 0,
        passedTests: 0,
        errors: '',
      };
    }

    if (!jsxContent || jsxContent.trim() === '') {
      return {
        passed: false,
        totalTests: 0,
        passedTests: 0,
        errors: '[Error] User have to enter ReactJS code to evaluate!',
      };
    }

    // sandbox
    const fileName = uuidv4();
    const tempDir = path.join(process.cwd(), 'behavior_evaluate', fileName);

    try {
      await fs.mkdir(tempDir, { recursive: true });

      const sandboxTsConfig = {
        compilerOptions: {
          jsx: 'react',
          esModuleInterop: true,
          allowJs: true,
          skipLibCheck: true,
        },
        include: ['**/*'],
      };
      await fs.writeFile(
        path.join(tempDir, 'tsconfig.json'),
        JSON.stringify(sandboxTsConfig),
        this.ENCODING,
      );

      const sandboxJestConfig = {
        testEnvironment: 'jest-environment-jsdom',
        rootDir: '.',
        transform: {
          '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
              isolatedModules: true,
              diagnostics: false,
              tsconfig: '<rootDir>/tsconfig.json',
            },
          ],
        },
      };
      await fs.writeFile(
        path.join(tempDir, 'jest.config.json'),
        JSON.stringify(sandboxJestConfig),
        this.ENCODING,
      );

      // ghi các code mẫu và usercode vào các file
      const userCodePath = path.join(tempDir, 'UserCode.jsx');
      const testCodePath = path.join(tempDir, 'UserCode.test.jsx');
      await fs.writeFile(userCodePath, jsxContent, this.ENCODING);
      await fs.writeFile(testCodePath, testScript, this.ENCODING);

      // chạy test bằng terminal
      const cmd = `npx jest UserCode.test.jsx --config=jest.config.json --json --testTimeout=5000 --passWithNoTests`;
      this.logger.debug(`[BehaviorTest] Running in sandbox: ${cmd}`);

      const { stdout } = await execAsync(cmd, { cwd: tempDir });
      const testResult = JSON.parse(stdout);
      const isPassed = testResult.numFailedTests === 0;

      return {
        passed: isPassed,
        totalTests: testResult.numTotalTests,
        passedTests: testResult.numPassedTests,
        errors: isPassed ? '' : this.extractErrors(testResult),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.stdout) {
        try {
          const testResult = JSON.parse(error.stdout);
          return {
            passed: false,
            totalTests: testResult.numTotalTests || 0,
            passedTests: testResult.numPassedTests || 0,
            errors: this.extractErrors(testResult),
          };
        } catch (parseError) {
          this.logger.error(`[BehaviorTest] Parsing error: ${parseError}`);
          return {
            passed: false,
            totalTests: 0,
            passedTests: 0,
            errors: '[Error] Sandbox error!',
          };
        }
      }

      this.logger.error(
        `[BehaviorTest] Internal system error: ${error.message}`,
      );
      return {
        passed: false,
        totalTests: 0,
        passedTests: 0,
        errors: `Environment error: ${error.message}`,
      };
    } finally {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
        this.logger.debug(`[BehaviorTest] Sandbox cleared: ${fileName}`);
      } catch (error: any) {
        this.logger.error(
          `[BehaviorTest] Cannot clear sandbox: ${error.message}`,
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractErrors(jestResult: any): string {
    if (!jestResult.testResults || jestResult.testResults.length === 0) {
      return '';
    }
    const allErrors: string[] = [];
    const esc = String.fromCharCode(27);
    const ansiRegex = new RegExp(`${esc}\\[[0-9;]*[a-zA-Z]`, 'g');

    for (const testSuite of jestResult.testResults) {
      if (testSuite.message) {
        let cleanMsg = testSuite.message.replace(ansiRegex, '');

        const dumpKeywords = [
          'Ignored nodes: comments',
          '<body>',
          'DOM Testing Library v',
        ];
        for (const keyword of dumpKeywords) {
          const dumpIndex = cleanMsg.indexOf(keyword);
          if (dumpIndex !== -1) {
            cleanMsg = cleanMsg.substring(0, dumpIndex);
          }
        }

        const lines = cleanMsg.split('\n');
        const filteredLines = lines.filter((line: string) => {
          if (/^\s*(?:>\s*)?\d+\s*\|/.test(line)) return false;
          if (/^\s*at\s+/.test(line)) return false;
          if (line.includes('UserCode.test.jsx')) return false;
          return true;
        });

        const finalBlock = filteredLines
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
        if (finalBlock) {
          allErrors.push(finalBlock);
        }
      }
    }
    return allErrors.join('\n\n----------------------------------------\n\n');
  }
}
