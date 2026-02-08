export class UserProfileEntity {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string;
  phone: string;
  address: string;
  isPhoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserProfileEntity>) {
    Object.assign(this, partial);
  }
}
