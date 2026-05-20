import { Module } from '@nestjs/common';

import { EditorController } from '../editor_controllers/editor.controller';
import { EditorService } from '../editor_service/editor.service';

@Module({
  controllers: [EditorController],
  providers: [EditorService],
})
export class EditorModule {}
