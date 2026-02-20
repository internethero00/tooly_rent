import { Module } from '@nestjs/common';
import { ToolModule } from '../presentation/tool/tool.module';
import { CategoryModule } from '../presentation/category/category.module';

@Module({
  imports: [ToolModule, CategoryModule],
})
export class AppModule {}
