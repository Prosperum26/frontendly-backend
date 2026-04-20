import { Expose } from 'class-transformer';

import { User } from '@/users/schemas';

export class MyProfileResponse {
  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string;

  constructor(user: User) {
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.avatarUrl = user.avatarUrl;
  }
}
