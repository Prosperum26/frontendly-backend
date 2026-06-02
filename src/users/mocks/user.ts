import { Types } from 'mongoose';

import { User } from '../schemas';

export class MockUserBuilder {
  private user: User;

  constructor() {
    this.user = {
      _id: new Types.ObjectId(),
      avatarUrl: 'https://www.example.com/avatar.jpg',
      badges: [],
      credentials: {},
      email: 'johndoe@gmail.com',
      firstName: 'John',
      googleId: '1234567890',
      isBanned: false,
      isDeleted: false,
      isSuspended: false,
      lastName: 'Doe',
      name: 'John Doe',
      role: 'user',
      skills: [],
      social_accounts: [],
      stage_progress: {},
      stats: {},
      username: 'johndoe',
    };
  }

  public build(): User {
    return this.user;
  }
}
