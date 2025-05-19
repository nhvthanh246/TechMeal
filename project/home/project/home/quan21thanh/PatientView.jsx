import { useState, useRef, useEffect } from "react";
import {
  Calendar,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  UserRound,
  ClipboardList,
  FileText,
  LogOut,
  Pill,
  Settings,
  Home,
  Coffee,
  Upload,
  Download,
  FilePlus,
  AlertCircle,
  X,
  Eye,
  Save,
} from "lucide-react";

// Define the HospitalMealSystem component that was missing
export default function HospitalMealSystem({
  patients,
  meals,
  onLogout,
  currentDate,
}) {
  const [updatedMeals, setUpdatedMeals] = useState(meals);

  const handleUpdateMeals = (newMeals) => {
    setUpdatedMeals(newMeals);
  };

  return (
    <KitchenView
      patients={patients}
      meals={updatedMeals}
      onLogout={onLogout}
      currentDate={currentDate}
      onUpdateMeals={handleUpdateMeals}
    />
  );
}

// Keep the KitchenView component as it was
export function KitchenView({
  patients,
  meals,
  onLogout,
  currentDate,
  onUpdateMeals,
}) {
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const [showMealExport, setShowMealExport] = useState(false);
  const [showPatientRequests, setShowPatientRequests] = useState(false);
  const [patientRequests, setPatientRequests] = useState([]);
  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);

  // State để lưu thông tin món ăn khi thêm mới
  const [newMealForm, setNewMealForm] = useState({
    name: "",
    calories: "",
    protein: "",
    ingredients: "",
    suitable: "",
  });

  // Function to handle meal type change
  const handleMealTypeChange = (type) => {
    setSelectedMealType(type);
  };

  // Function to export meal data as JSON file
  const exportMealData = () => {
    const mealData = JSON.stringify(meals, null, 2);
    const blob = new Blob([mealData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `meals-data-${currentDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showNotification("Đã xuất dữ liệu thành công", "success");
  };

  // Function to handle meal data import
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMeals = JSON.parse(e.target.result);

        // Validate imported data structure
        if (
          !importedMeals.breakfast ||
          !importedMeals.lunch ||
          !importedMeals.dinner
        ) {
          throw new Error("Định dạng dữ liệu không hợp lệ");
        }

        // Update meals with the imported data
        if (typeof onUpdateMeals === "function") {
          onUpdateMeals(importedMeals);
          showNotification("Đã nhập dữ liệu thành công", "success");
        }
      } catch (error) {
        showNotification("Lỗi khi nhập dữ liệu: " + error.message, "error");
      }
    };

    reader.readAsText(file);
    event.target.value = null; // Reset file input
  };

  // Function to get meal recommendations for a patient
  const getPatientMeals = (patient) => {
    // Check if patient has a custom meal selection
    if (patient.customMeal && patient.customMeal[selectedMealType]) {
      const customMealId = patient.customMeal[selectedMealType];
      return meals[selectedMealType].find((meal) => meal.id === customMealId);
    }

    const patientConditions = patient.conditions;

    // Find meals suitable for the patient's conditions
    const suitableMeals = meals[selectedMealType]
      .filter((meal) => {
        // If patient has no special conditions, all meals are suitable
        if (patientConditions.length === 0) return true;

        // Otherwise, select meals suitable for at least one condition
        return patientConditions.some((condition) =>
          meal.suitable.includes(condition)
        );
      })
      .sort((a, b) => {
        // Prioritize meals that match more conditions
        const aMatchCount = patientConditions.filter((c) =>
          a.suitable.includes(c)
        ).length;
        const bMatchCount = patientConditions.filter((c) =>
          b.suitable.includes(c)
        ).length;
        return bMatchCount - aMatchCount;
      });

    return suitableMeals.length > 0 ? suitableMeals[0] : null;
  };

  // Function to handle adding a new meal
  const handleAddNewMeal = () => {
    if (!newMealForm.name || !newMealForm.calories) {
      showNotification("Vui lòng điền đầy đủ thông tin", "error");
      return;
    }

    const newMeal = {
      id: `meal-${Date.now()}`,
      name: newMealForm.name,
      calories: parseInt(newMealForm.calories) || 0,
      protein: newMealForm.protein || "N/A",
      ingredients: newMealForm.ingredients.split(",").map((i) => i.trim()),
      suitable: newMealForm.suitable
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };

    const updatedMeals = {
      ...meals,
      [selectedMealType]: [...meals[selectedMealType], newMeal],
    };

    if (typeof onUpdateMeals === "function") {
      onUpdateMeals(updatedMeals);

      // Reset form
      setNewMealForm({
        name: "",
        calories: "",
        protein: "",
        ingredients: "",
        suitable: "",
      });

      setShowMealExport(false);
      showNotification("Đã thêm món ăn mới thành công", "success");
    }
  };

  // Function to show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Function to handle meal request approvals
  const handleApproveRequest = (requestId) => {
    setPatientRequests((prev) => prev.filter((req) => req.id !== requestId));
    showNotification("Đã chấp nhận yêu cầu", "success");
  };

  // Simulated patient requests data
  const mockPatientRequests = [
    {
      id: "req1",
      patientId: "BN001",
      patientName: "Nguyễn Văn A",
      mealType: "lunch",
      requestedMealId: "meal2",
      requestedMealName: "Cơm gà luộc",
      requestDate: currentDate,
      reason: "Không thích món được chỉ định",
    },
    {
      id: "req2",
      patientId: "BN003",
      patientName: "Trần Thị C",
      mealType: "dinner",
      requestedMealId: "meal5",
      requestedMealName: "Cháo thịt bằm",
      requestDate: currentDate,
      reason: "Đang buồn nôn, muốn ăn nhẹ",
    },
  ];

  // Load patient requests on component mount
  useEffect(() => {
    setPatientRequests(mockPatientRequests);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-3 text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Quản lý Bếp</h1>
              <div className="flex items-center mt-1">
                <Coffee className="h-4 w-4 mr-2" />
                <span className="text-sm">Giao diện Nhân viên Bếp</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {patientRequests.length > 0 && (
                <button
                  onClick={() => setShowPatientRequests((prev) => !prev)}
                  className="relative bg-blue-700 hover:bg-blue-800 text-white py-1 px-3 rounded-lg flex items-center"
                >
                  <ClipboardList className="h-4 w-4 mr-1" />
                  <span>Yêu cầu ({patientRequests.length})</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {patientRequests.length}
                  </span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="bg-blue-700 hover:bg-blue-800 text-white py-1 px-3 rounded-lg flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <span className="font-medium">{selectedDate}</span>
              </div>

              <div className="space-x-2">
                <button
                  onClick={() => handleMealTypeChange("breakfast")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedMealType === "breakfast"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Bữa sáng
                </button>
                <button
                  onClick={() => handleMealTypeChange("lunch")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedMealType === "lunch"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Bữa trưa
                </button>
                <button
                  onClick={() => handleMealTypeChange("dinner")}
                  className={`px-3 py-1 rounded-lg ${
                    selectedMealType === "dinner"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Bữa tối
                </button>
              </div>

              <div className="flex space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current.click()}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
                  title="Nhập dữ liệu thực đơn"
                >
                  <Upload className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={exportMealData}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
                  title="Xuất dữ liệu thực đơn"
                >
                  <Download className="h-5 w-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setShowMealExport(!showMealExport)}
                  className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
                >
                  <FilePlus className="h-5 w-5 text-gray-700" />
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
                  <Settings className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Form để thêm món ăn mới */}
            {showMealExport && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Thêm món ăn mới</h3>
                  <button
                    onClick={() => setShowMealExport(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên món ăn
                    </label>
                    <input
                      type="text"
                      value={newMealForm.name}
                      onChange={(e) =>
                        setNewMealForm({ ...newMealForm, name: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="VD: Cháo thịt bằm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lượng calo (kcal)
                    </label>
                    <input
                      type="number"
                      value={newMealForm.calories}
                      onChange={(e) =>
                        setNewMealForm({
                          ...newMealForm,
                          calories: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="VD: 250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lượng protein
                    </label>
                    <input
                      type="text"
                      value={newMealForm.protein}
                      onChange={(e) =>
                        setNewMealForm({
                          ...newMealForm,
                          protein: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="VD: 15g"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phù hợp với bệnh lý
                    </label>
                    <input
                      type="text"
                      value={newMealForm.suitable}
                      onChange={(e) =>
                        setNewMealForm({
                          ...newMealForm,
                          suitable: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="VD: Tiểu đường, Huyết áp cao (cách nhau bằng dấu phẩy)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành phần (cách nhau bằng dấu phẩy)
                    </label>
                    <textarea
                      value={newMealForm.ingredients}
                      onChange={(e) =>
                        setNewMealForm({
                          ...newMealForm,
                          ingredients: e.target.value,
                        })
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="VD: Gạo, thịt băm, hành, tiêu, muối"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAddNewMeal}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu món ăn
                  </button>
                </div>
              </div>
            )}

            {/* Patient meal requests */}
            {showPatientRequests && patientRequests.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">
                    Yêu cầu thay đổi thực đơn từ bệnh nhân
                  </h3>
                  <button
                    onClick={() => setShowPatientRequests(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {patientRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border bg-white rounded-lg p-3"
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            {request.patientName} ({request.patientId})
                          </p>
                          <p className="text-sm text-gray-500">
                            Yêu cầu chuyển sang món:{" "}
                            <span className="font-medium text-gray-700">
                              {request.requestedMealName}
                            </span>{" "}
                            vào{" "}
                            {request.mealType === "breakfast"
                              ? "Bữa sáng"
                              : request.mealType === "lunch"
                              ? "Bữa trưa"
                              : "Bữa tối"}
                          </p>
                          <p className="text-sm italic mt-1">
                            "{request.reason}"
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="bg-green-100 hover:bg-green-200 text-green-800 py-1 px-3 rounded flex items-center"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            <span>Chấp nhận</span>
                          </button>
                          <button className="bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded flex items-center">
                            <X className="h-4 w-4 mr-1" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Danh sách bệnh nhân -{" "}
                {selectedMealType === "breakfast"
                  ? "Bữa sáng"
                  : selectedMealType === "lunch"
                  ? "Bữa trưa"
                  : "Bữa tối"}
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Mã BN
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Họ tên
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Phòng
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Giường
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Tình trạng
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Món ăn
                      </th>
                      <th className="py-2 px-2 text-center text-sm font-medium text-gray-600">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => {
                      const meal = getPatientMeals(patient);
                      const isCustomSelection =
                        patient.customMeal &&
                        patient.customMeal[selectedMealType];

                      return (
                        <tr key={patient.id} className="border-t">
                          <td className="py-2 px-2">{patient.id}</td>
                          <td className="py-2 px-2">{patient.name}</td>
                          <td className="py-2 px-2">{patient.room}</td>
                          <td className="py-2 px-2">{patient.bed}</td>
                          <td className="py-2 px-2">
                            <div className="flex flex-wrap gap-1">
                              {patient.conditions.length > 0 ? (
                                patient.conditions.map((condition) => (
                                  <span
                                    key={condition}
                                    className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    <Pill className="h-3 w-3 mr-1" />
                                    {condition}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">
                                  Không có
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2">
                            {meal ? (
                              <div>
                                <div className="font-medium flex items-center">
                                  {meal.name}
                                  {isCustomSelection && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                                      Tự chọn
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {meal.calories} kcal
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">
                                Không có món phù hợp
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="inline-flex items-center space-x-2">
                              <button className="bg-green-100 hover:bg-green-200 text-green-800 py-1 px-2 rounded flex items-center">
                                <Check className="h-4 w-4 mr-1" />
                                <span>Hoàn thành</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Tổng hợp thực phẩm cần chuẩn bị
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Món ăn
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Số lượng
                      </th>
                      <th className="py-2 px-2 text-left text-sm font-medium text-gray-600">
                        Nguyên liệu cần chuẩn bị
                      </th>
                      <th className="py-2 px-2 text-center text-sm font-medium text-gray-600">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {meals[selectedMealType].map((meal) => {
                      // Count how many patients get this meal
                      const count = patients.filter((patient) => {
                        const recommendedMeal = getPatientMeals(patient);
                        return (
                          recommendedMeal && recommendedMeal.id === meal.id
                        );
                      }).length;

                      if (count > 0) {
                        return (
                          <tr key={meal.id} className="border-t">
                            <td className="py-2 px-2">
                              <div className="font-medium">{meal.name}</div>
                              <div className="text-sm text-gray-500">
                                {meal.calories} kcal
                              </div>
                            </td>
                            <td className="py-2 px-2">{count}</td>
                            <td className="py-2 px-2">
                              <div className="flex flex-wrap gap-1">
                                {meal.ingredients.map((ingredient) => (
                                  <span
                                    key={ingredient}
                                    className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                                  >
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded flex items-center justify-center mx-auto">
                                <FileText className="h-4 w-4 mr-1" />
                                <span>In công thức</span>
                              </button>
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
