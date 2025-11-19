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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { QueryVehiclesDto } from './dto/query-vehicles.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard, Permissions } from '../auth/guards/permissions.guard';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Permissions('edit')
  @ApiOperation({ summary: 'Create a new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 409, description: 'Vehicle already exists' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @Permissions('view')
  @ApiOperation({ summary: 'Get all vehicles with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Vehicles retrieved successfully' })
  findAll(@Query() query: QueryVehiclesDto) {
    return this.vehiclesService.findAll(query);
  }

  @Get('stats')
  @Permissions('view')
  @ApiOperation({ summary: 'Get vehicle statistics' })
  @ApiResponse({ status: 200, description: 'Vehicle statistics retrieved successfully' })
  getStats() {
    return this.vehiclesService.getVehicleStats();
  }

  @Get('tax-expiry-soon')
  @Permissions('view')
  @ApiOperation({ summary: 'Get vehicles with tax expiry within 30 days' })
  @ApiResponse({ status: 200, description: 'Tax expiry vehicles retrieved successfully' })
  getTaxExpirySoon() {
    return this.vehiclesService.getTaxExpirySoon();
  }

  @Get('plate/:plateNumber')
  @Permissions('view')
  @ApiOperation({ summary: 'Get vehicle by plate number' })
  @ApiResponse({ status: 200, description: 'Vehicle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findByPlateNumber(@Param('plateNumber') plateNumber: string) {
    return this.vehiclesService.findByPlateNumber(plateNumber);
  }

  @Get(':id')
  @Permissions('view')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Put(':id')
  @Permissions('edit')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(id, updateVehicleDto);
  }

  @Put(':id/tax-status')
  @Permissions('edit')
  @ApiOperation({ summary: 'Update vehicle tax status' })
  @ApiResponse({ status: 200, description: 'Tax status updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  updateTaxStatus(
    @Param('id') id: string,
    @Body() body: { taxStatus: string; taxExpiryDate?: string }
  ) {
    return this.vehiclesService.updateTaxStatus(id, body.taxStatus, body.taxExpiryDate);
  }

  @Delete(':id')
  @Permissions('delete')
  @ApiOperation({ summary: 'Delete vehicle (soft delete)' })
  @ApiResponse({ status: 200, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(id);
  }
}