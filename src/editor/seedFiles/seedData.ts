
import mongoose from 'mongoose';

import { ExerciseSchema } from '../db_schemas/exercise_schema';
import { SubmissionSchema } from '../db_schemas/submission_schema';
import { UserSchema } from '../db_schemas/userFake_schema';

import seedEx from './seedEx';
import seedSubmit from './seedSubmit';
import seedUser from './seedUser';

const MONGO_URI = 'mongodb://localhost:27017/frontnendly';

async function runSeed(): Promise<void> {
    try {
        // 1. Kết nối DB
        await mongoose.connect(MONGO_URI);

        const UserModel = mongoose.model('User', UserSchema);
        const PracticeModel = mongoose.model('Exercise', ExerciseSchema);
        const SubmitModel = mongoose.model('Submission', SubmissionSchema);

        console.log('Xóa dữ liệu');
        await UserModel.deleteMany({});
        await PracticeModel.deleteMany({});
        await SubmitModel.deleteMany({});

        console.log('Nạp dữ liệu');
        await UserModel.insertMany(seedUser);
        await PracticeModel.insertMany(seedEx);
        await SubmitModel.insertMany(seedSubmit);

        console.log('\nXong');
        process.exit(0); 
    } catch (error) {
        console.error('\n❌Error: ', error);
        process.exit(1); 
    }
}

void runSeed();