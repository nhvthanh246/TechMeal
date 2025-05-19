// LoginView
import { useState } from "react";
import { UserRound, Coffee, User } from "lucide-react";

// Login View Component
export function LoginView({ onLogin }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Hệ Thống Quản Lý Bữa Ăn Bệnh Viện
        </h1>

        <div className="space-y-4">
          <button
            onClick={() => onLogin("doctor")}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            <UserRound className="h-5 w-5 mr-2" />
            Đăng nhập với tư cách Bác sĩ
          </button>

          <button
            onClick={() => onLogin("kitchen")}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            <Coffee className="h-5 w-5 mr-2" />
            Đăng nhập với tư cách Nhà ăn
          </button>

          <button
            onClick={() => onLogin("patient")}
            className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          >
            <User className="h-5 w-5 mr-2" />
            Đăng nhập với tư cách Bệnh nhân
          </button>
        </div>
      </div>
    </div>
  );
}
