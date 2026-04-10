/**
 * Translate AWS Cognito error names to user-friendly Vietnamese messages.
 */
export function translateCognitoError(error: any): string {
  if (!error) return "Đã có lỗi xảy ra. Vui lòng thử lại.";

  const errorName = error.name || error.code;
  const message = error.message || "";

  switch (errorName) {
    // Auth errors
    case 'UserNotFoundException':
      return "Tài khoản không tồn tại.";
    case 'NotAuthorizedException':
      return "Email hoặc mật khẩu không chính xác.";
    case 'UserNotConfirmedException':
      return "Tài khoản của bạn chưa được xác nhận. Vui lòng kiểm tra email.";
    case 'PasswordResetRequiredException':
      return "Yêu cầu đặt lại mật khẩu của bạn đang được xử lý.";
    case 'UserLambdaValidationException':
      return "Lỗi xác thực người dùng từ hệ thống.";
    
    // SignUp errors
    case 'UsernameExistsException':
      return "Email này đã được sử dụng bởi một tài khoản khác.";
    case 'InvalidPasswordException':
      if (message.includes('uppercase')) return "Mật khẩu cần ít nhất một chữ viết hoa.";
      if (message.includes('numeric')) return "Mật khẩu cần ít nhất một chữ số.";
      if (message.includes('symbol')) return "Mật khẩu cần ít nhất một ký tự đặc biệt.";
      return "Mật khẩu không đáp ứng yêu cầu bộ bảo mật của hệ thống.";
    
    // OTP/Verification errors
    case 'CodeMismatchException':
      return "Mã xác nhận không chính xác. Vui lòng kiểm tra lại.";
    case 'ExpiredCodeException':
      return "Mã xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.";
    case 'CodeDeliveryFailureException':
      return "Không thể gửi mã xác nhận. Vui lòng kiểm tra lại email.";

    // Limit/General errors
    case 'LimitExceededException':
      return "Hành động quá nhanh. Vui lòng đợi một lát trước khi thử lại.";
    case 'TooManyRequestsException':
      return "Hệ thống đang bận. Vui lòng thử lại sau vài phút.";
    case 'InvalidParameterException':
      if (message.includes('username')) return "Định dạng email không hợp lệ.";
      return "Thông tin cung cấp không hợp lệ.";
    case 'NotEnabledException':
      return "Tài khoản của bạn đã bị vô hiệu hóa.";
    
    default:
      console.error("Unhandle Cognito Error:", errorName, message);
      return "Đã có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.";
  }
}
