export const ACCOUNT_DELETION_STARTED = 'account.user.deletion-started.event';
export const USER_PROFILE_DELETED = 'user-profile.deleted.event';
export const USER_PROFILE_DELETION_FAILED = 'user-profile.deletion-failed.event';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AccountUserDeletionStarted {
  export class Event {
    userId?: string;
    email?: string;
    sagaId?: string;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserProfileDeleted {
  export class Event {
    userId?: string;
    sagaId?: string;
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserProfileDeletionFailed {
  export class Event {
    userId?: string;
    sagaId?: string;
    error?: string;
  }
}
