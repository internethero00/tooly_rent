export class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
