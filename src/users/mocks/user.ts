import { Types } from 'mongoose';

import { User } from '../schemas';

export class MockUserBuilder {
  private user: User;

  constructor() {
    this.user = {
      _id: new Types.ObjectId(),
      email: 'johndoe@gmail.com',
      googleId: '1234567890',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://www.example.com/avatar.jpg',
    };
  }

  public build(): User {
    return this.user;
  }
}
