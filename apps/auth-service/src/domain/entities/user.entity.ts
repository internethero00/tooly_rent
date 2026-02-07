export class UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  deletionSagaId: string | null;
  deletionRequestedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  get isPendingDeletion(): boolean {
    return this.status === AccountStatus.PENDING_DELETION;
  }
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PENDING_DELETION = 'PENDING_DELETION',
}
