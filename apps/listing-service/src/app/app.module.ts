import { Module } from '@nestjs/common';
import { ToolModule } from '../presentation/tool/tool.module';

@Module({
  imports: [ToolModule]
})
export class AppModule {}
