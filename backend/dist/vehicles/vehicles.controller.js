"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vehicles_service_1 = require("./vehicles.service");
const create_vehicle_dto_1 = require("./dto/create-vehicle.dto");
const update_vehicle_dto_1 = require("./dto/update-vehicle.dto");
const query_vehicles_dto_1 = require("./dto/query-vehicles.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("../auth/guards/permissions.guard");
let VehiclesController = class VehiclesController {
    constructor(vehiclesService) {
        this.vehiclesService = vehiclesService;
    }
    create(createVehicleDto) {
        return this.vehiclesService.create(createVehicleDto);
    }
    findAll(query) {
        return this.vehiclesService.findAll(query);
    }
    getStats() {
        return this.vehiclesService.getVehicleStats();
    }
    getTaxExpirySoon() {
        return this.vehiclesService.getTaxExpirySoon();
    }
    findByPlateNumber(plateNumber) {
        return this.vehiclesService.findByPlateNumber(plateNumber);
    }
    findOne(id) {
        return this.vehiclesService.findOne(id);
    }
    update(id, updateVehicleDto) {
        return this.vehiclesService.update(id, updateVehicleDto);
    }
    updateTaxStatus(id, body) {
        return this.vehiclesService.updateTaxStatus(id, body.taxStatus, body.taxExpiryDate);
    }
    remove(id) {
        return this.vehiclesService.remove(id);
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_guard_1.Permissions)('edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new vehicle' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vehicle created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Vehicle already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_dto_1.CreateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all vehicles with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicles retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_vehicles_dto_1.QueryVehiclesDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle statistics retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('tax-expiry-soon'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicles with tax expiry within 30 days' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tax expiry vehicles retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getTaxExpirySoon", null);
__decorate([
    (0, common_1.Get)('plate/:plateNumber'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle by plate number' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('plateNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findByPlateNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_guard_1.Permissions)('view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get vehicle by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_guard_1.Permissions)('edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Update vehicle' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_dto_1.UpdateVehicleDto]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/tax-status'),
    (0, permissions_guard_1.Permissions)('edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Update vehicle tax status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tax status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "updateTaxStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_guard_1.Permissions)('delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete vehicle (soft delete)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Vehicle deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "remove", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles'),
    (0, common_1.Controller)('vehicles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService])
], VehiclesController);
//# sourceMappingURL=vehicles.controller.js.map