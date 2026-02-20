import { Controller } from '@nestjs/common';
import {ToolService} from "./tool.service";

@Controller()
export class ToolController {
  constructor(private readonly toolyService: ToolService) {}


}
