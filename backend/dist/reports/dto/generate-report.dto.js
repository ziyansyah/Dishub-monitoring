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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateReportDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerateReportDto {
    constructor() {
        this.type = 'vehicle-data';
    }
}
exports.GenerateReportDto = GenerateReportDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Report title',
        example: 'Laporan Kendaraan Januari 2025',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start date for report data (YYYY-MM-DD)',
        example: '2025-01-01',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End date for report data (YYYY-MM-DD)',
        example: '2025-01-31',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax status filter',
        example: 'all',
        enum: ['all', 'lunas', 'belum-lunas'],
    }),
    (0, class_validator_1.IsEnum)(['all', 'lunas', 'belum-lunas']),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "taxStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Report file format',
        example: 'pdf',
        enum: ['pdf', 'excel'],
    }),
    (0, class_validator_1.IsEnum)(['pdf', 'excel']),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Report type',
        example: 'vehicle-data',
        enum: ['vehicle-data', 'scan-history', 'tax-compliance', 'activity-logs'],
        required: false,
    }),
    (0, class_validator_1.IsEnum)(['vehicle-data', 'scan-history', 'tax-compliance', 'activity-logs']),
    __metadata("design:type", String)
], GenerateReportDto.prototype, "type", void 0);
//# sourceMappingURL=generate-report.dto.js.map