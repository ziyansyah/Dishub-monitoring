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
exports.CreateScanDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateScanDto {
}
exports.CreateScanDto = CreateScanDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detected plate number from CCTV/image',
        example: 'BK 1234 AB',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanDto.prototype, "plateNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle type',
        example: 'Mobil',
        enum: ['Mobil', 'Motor', 'Truk'],
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanDto.prototype, "vehicleType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Vehicle color',
        example: 'Merah',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Owner name (if found in database)',
        example: 'Ahmad Wijaya',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanDto.prototype, "ownerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Tax status (if found in database)',
        example: 'Aktif',
        enum: ['Aktif', 'Mati'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanDto.prototype, "taxStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Scan location',
        example: 'Jl. Gatot Subroto - Medan',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Additional metadata about the scan',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateScanDto.prototype, "metadata", void 0);
//# sourceMappingURL=create-scan.dto.js.map