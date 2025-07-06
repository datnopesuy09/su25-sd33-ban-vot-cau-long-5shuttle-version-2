import React from 'react';
import { CheckCircle, ShoppingBag, Package, Clock, Star, Trophy, Zap } from 'lucide-react';

const SuccessOrder = ({ orderNumber = "VCL2024061201", onContinueShopping }) => {
  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      window.location.href = '/san-pham';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2f19ae] to-purple-500 to-blue-600 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Shuttlecock pattern */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-white/15 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-1/4 w-4 h-4 bg-white/10 rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-white/5 rounded-full animate-pulse delay-500"></div>
        
        {/* Net pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-20 gap-1 h-full">
            {Array.from({length: 400}).map((_, i) => (
              <div key={i} className="border border-white/30"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-7xl w-full">
          {/* Main Horizontal Layout */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              
              {/* Left Side - Success Message & Visual */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 lg:p-12 flex flex-col justify-center relative">
                {/* Success Animation */}
                <div className="text-center lg:text-left mb-8">
                  <div className="relative inline-block mb-6">
                    {/* Racket illustration */}
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-[#2f19ae] to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce mx-auto lg:mx-0">
                      <CheckCircle className="w-12 h-12 lg:w-14 lg:h-14 text-white" />
                    </div>
                    
                    {/* Success sparkles */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-ping">
                      <Star className="w-3 h-3 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -left-2 w-4 h-4 bg-orange-400 rounded-full animate-pulse delay-300"></div>
                    <div className="absolute top-1 -left-4 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-700"></div>
                  </div>
                  
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-[#2f19ae] to-purple-500 bg-clip-text text-transparent mb-4">
                    Ace! Đặt hàng thành công! 🏸
                  </h1>
                  <p className="text-gray-600 text-lg lg:text-xl leading-relaxed mb-6">
                    Chúc mừng! Bạn đã sở hữu những chiếc vợt cầu lông tuyệt vời. 
                    <br />Hãy sẵn sàng để <span className="font-semibold text-emerald-600">thống trị sân đấu</span>!
                  </p>
                  
                  {/* Main CTA Button - Prominently Placed */}
                  <button
                    onClick={handleContinueShopping}
                    className="w-full lg:w-auto bg-gradient-to-r from-[#2f19ae] to-purple-500 to-blue-500 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-600 text-white font-bold py-4 px-8 lg:px-12 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group text-lg"
                  >
                    <ShoppingBag className="w-6 h-6 group-hover:animate-bounce" />
                    <span>Tiếp tục mua sắm - Nâng cấp gear! 🔥</span>
                  </button>
                </div>

                {/* Floating Sports Elements */}
                <div className="absolute top-10 right-10 text-4xl lg:text-6xl animate-pulse opacity-20">🏸</div>
                <div className="absolute bottom-10 left-10 text-3xl lg:text-4xl animate-bounce opacity-20 delay-300">🏆</div>
              </div>

              {/* Right Side - Order Details & Info */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                
                {/* Order Info Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-emerald-800">Chi tiết đơn hàng</h3>
                    </div>
                    <Package className="w-6 h-6 text-emerald-600" />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 px-4 bg-white rounded-xl border border-emerald-100">
                      <span className="text-gray-600 font-medium">Mã đơn hàng:</span>
                      <span className="font-bold text-emerald-600 text-lg">#{orderNumber}</span>
                    </div>
                    
                    <div className="flex items-center gap-3 text-emerald-700 bg-white/70 rounded-xl p-3">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        Vợt của bạn sẽ được chuẩn bị trong 1-2 ngày làm việc
                      </span>
                    </div>
                  </div>
                </div>

                {/* Game Plan Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-blue-800">Game Plan - Tiếp theo sẽ ra sao?</h4>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center gap-3 text-blue-700">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">📧 Email xác nhận sẽ được gửi ngay</span>
                    </div>
                    <div className="flex items-center gap-3 text-blue-700">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">📱 Theo dõi đơn hàng qua SMS/Email</span>
                    </div>
                    <div className="flex items-center gap-3 text-blue-700">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">🚚 Nhận hàng trong 3-5 ngày làm việc</span>
                    </div>
                    <div className="flex items-center gap-3 text-blue-700">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">🏸 Sẵn sàng cho trận đấu tiếp theo!</span>
                    </div>
                  </div>
                </div>

                {/* Secondary Actions */}
                <div className="space-y-3">
                  <button className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-2xl border-2 border-gray-200 hover:border-emerald-300 transition-all duration-200 shadow-md hover:shadow-lg">
                    📦 Theo dõi đơn hàng
                  </button>
                  
                  {/* Champion Footer */}
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                    <p className="text-sm text-gray-600 mb-1">
                      🏆 <span className="font-semibold">Hotline Champion Support:</span>
                    </p>
                    <p className="text-lg font-bold text-emerald-600">📞 1900-1234</p>
                    <p className="text-xs text-gray-500 mt-1">
                      "Chúng tôi luôn sẵn sàng hỗ trợ bạn trở thành nhà vô địch!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements - Positioned for wide layout */}
          <div className="absolute -z-10 top-10 right-1/4 text-4xl animate-pulse opacity-20 delay-500">⭐</div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOrder;