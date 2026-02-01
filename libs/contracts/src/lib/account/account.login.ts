import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AccountLogin {
  export const topic = 'account.login.command';
  export class Request {
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;
    @IsString({ message: 'Password is required' })
    @IsNotEmpty({ message: 'Password is required' })
    password!: string;
  }
  export class Response {
    access_token?: string;
    refresh_token?: string;
    id?: string;
    email?: string;
    role?: string;
  }
}
