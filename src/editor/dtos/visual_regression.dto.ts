export class VisualEvaluationDto {
  deviceType!: string; // VD: 'desktop' hoặc 'mobile'
  passed!: boolean; // true nếu đạt, false nếu rớt
  matchPercentage!: number; // VD: 95.50
  diffImageUrl!: string | null; // Chuỗi Base64 của ảnh báo lỗi (hoặc null nếu Pass)
}
