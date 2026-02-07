import { AccountStatus, UserEntity, UserRole } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY')

export interface IUserRepository {
  create(data: CreateUserData): Promise<UserEntity>;

  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;

  delete(id: string): Promise<void>;
  update(id: string, data: UpdateUserData): Promise<UserEntity>;
  existsByEmail(email: string): Promise<boolean>;
  findStaleDeletions(olderThan: Date): Promise<UserEntity[]>;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  status?: AccountStatus;
  deletionSagaId?: string | null;
  deletionRequestedAt?: Date | null;
}
