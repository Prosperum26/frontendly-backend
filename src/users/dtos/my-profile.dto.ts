import { Expose } from 'class-transformer';

export class MyProfileResponse {
  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  name: string;

  @Expose()
  bio: string;

  constructor(user: any) {
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.avatarUrl = user.avatarUrl;
    this.name = user.name;
    this.bio = user.bio;
  }
}
