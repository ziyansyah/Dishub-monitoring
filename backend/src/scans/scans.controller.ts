import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScansService } from './scans.service';
import { CreateScanDto } from './dto/create-scan.dto';
import { QueryScansDto } from './dto/query-scans.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@ApiTags('Scans')
@Controller('scans')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  @Permissions('edit')
  @ApiOperation({ summary: 'Create a new vehicle scan' })
  @ApiResponse({ status: 201, description: 'Scan created successfully' })
  async create(
    @Body() createScanDto: CreateScanDto,
    @Request() req,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.scansService.create(createScanDto, req.user.id, ip, userAgent || 'Unknown');
  }

  @Get()
  @Permissions('view')
  @ApiOperation({ summary: 'Get all scans with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Scans retrieved successfully' })
  findAll(@Query() query: QueryScansDto) {
    return this.scansService.findAll(query);
  }

  @Get('recent')
  @Permissions('view')
  @ApiOperation({ summary: 'Get recent scans for dashboard' })
  @ApiResponse({ status: 200, description: 'Recent scans retrieved successfully' })
  findRecent(@Query('limit') limit?: number) {
    return this.scansService.findRecent(limit ? parseInt(limit) : 10);
  }

  @Get('history')
  @Permissions('view')
  @ApiOperation({ summary: 'Get scan history with date filtering' })
  @ApiResponse({ status: 200, description: 'Scan history retrieved successfully' })
  getHistory(@Query() query: QueryScansDto) {
    return this.scansService.getHistory(query);
  }

  @Get('stats')
  @Permissions('view')
  @ApiOperation({ summary: 'Get scan statistics and analytics' })
  @ApiResponse({ status: 200, description: 'Scan statistics retrieved successfully' })
  getStats() {
    return this.scansService.getScanStats();
  }

  @Get('locations')
  @Permissions('view')
  @ApiOperation({ summary: 'Get scan location statistics' })
  @ApiResponse({ status: 200, description: 'Location statistics retrieved successfully' })
  getLocations() {
    return this.scansService.getScanLocations();
  }

  @Get('top-vehicles')
  @Permissions('view')
  @ApiOperation({ summary: 'Get most frequently scanned vehicles' })
  @ApiResponse({ status: 200, description: 'Top scanned vehicles retrieved successfully' })
  getTopScannedVehicles(@Query('limit') limit?: number) {
    return this.scansService.getTopScannedVehicles(limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  @Permissions('view')
  @ApiOperation({ summary: 'Get scan by ID' })
  @ApiResponse({ status: 200, description: 'Scan retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  findOne(@Param('id') id: string) {
    return this.scansService.findOne(id);
  }

  @Delete(':id')
  @Permissions('delete')
  @ApiOperation({ summary: 'Delete scan record' })
  @ApiResponse({ status: 200, description: 'Scan deleted successfully' })
  @ApiResponse({ status: 404, description: 'Scan not found' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.scansService.deleteScan(id, req.user.id);
  }
}