// KitchenView.js
import React, { useState, useRef, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  Coffee,
  Download,
  FilePlus,
  LogOut,
  MessageSquareWarning, //Đổi thành MessageSquareText nếu có icon này, hoặc dùng MessageCircle
  ClipboardList,
  FileText,
  BellRing,
  PackageCheck,
  Save,
  Soup,
  Star, //Thêm icon Star
  Upload,
  UserCheck,
  X,
  XCircle,
  AlertCircle, // Thêm AlertCircle
  Info, // Thêm Info
  ChevronDown, // Thêm ChevronDown
  Eye, // Thêm Eye
} from "lucide-react";

export function KitchenView({
  patients,
  meals,
  onLogout,
  currentDate,
  onUpdateMeal,
  // onUpdatePatients, // Prop này có thể không cần thiết nếu KitchenView không sửa trực tiếp thông tin bệnh nhân
}) {
  const [selectedMainTab, setSelectedMainTab] = useState("service"); // 'service', 'reviews'
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [pendingSpecialRequests, setPendingSpecialRequests] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [patientReviews, setPatientReviews] = useState([]); // State mới cho đánh giá của bệnh nhân

  const fileInputRef = useRef(null);
  const [notification, setNotification] = useState(null);
  const [mealCompletionStatus, setMealCompletionStatus] = useState({});

  const [newMealForm, setNewMealForm] = useState({
    name: "",
    calories: "",
    protein: "",
    ingredients: "",
    suitable: "",
  });

  const showNotification = (message, type = "info", duration = 3500) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Hàm lấy tên bệnh nhân
  const getPatientNameById = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : "Không rõ";
  };

  // Load special requests, meal completion, completed orders (giữ nguyên)
  useEffect(() => {
    const checkForNewRequests = () => {
      try {
        const storedRequests = localStorage.getItem("kitchenRequests");
        if (storedRequests) {
          const allRequests = JSON.parse(storedRequests);
          const newSpecialReqs = allRequests.filter(
            (req) =>
              req.type === "specialMealRequest" &&
              req.status === "pending" &&
              req.requestDate === currentDate
          );
          if (
            JSON.stringify(pendingSpecialRequests) !==
            JSON.stringify(newSpecialReqs)
          ) {
            setPendingSpecialRequests(newSpecialReqs);
          }
        } else {
          setPendingSpecialRequests([]);
        }
      } catch (error) {
        console.error("Lỗi đọc YCĐB từ LS:", error);
      }
    };
    checkForNewRequests();
    const intervalId = setInterval(checkForNewRequests, 3000);
    return () => clearInterval(intervalId);
  }, [currentDate, pendingSpecialRequests]);

  useEffect(() => {
    try {
      const savedStatus = localStorage.getItem(
        `mealCompletionStatus_${currentDate}`
      );
      setMealCompletionStatus(savedStatus ? JSON.parse(savedStatus) : {});
    } catch (error) {
      console.error("Lỗi đọc trạng thái hoàn thành:", error);
    }
  }, [currentDate]);

  useEffect(() => {
    try {
      const savedCompletedOrders = localStorage.getItem(
        `completedOrders_${currentDate}`
      );
      setCompletedOrders(
        savedCompletedOrders ? JSON.parse(savedCompletedOrders) : []
      );
    } catch (error) {
      console.error("Lỗi đọc danh sách suất đã hoàn thành:", error);
    }
  }, [currentDate]);

  // Hàm mới: Load patient reviews
  const loadPatientReviews = () => {
    if (!patients || patients.length === 0) {
      setPatientReviews([]);
      return;
    }
    const allReviews = [];
    patients.forEach((patient) => {
      try {
        const ratingsKey = `mealRatings_${patient.id}_${currentDate}`;
        const storedRatings = localStorage.getItem(ratingsKey);
        if (storedRatings) {
          const parsedDayRatings = JSON.parse(storedRatings);
          Object.keys(parsedDayRatings).forEach((mealType) => {
            const reviewData = parsedDayRatings[mealType];
            if (reviewData && reviewData.rating) {
              // Chỉ lấy nếu có rating
              allReviews.push({
                patientId: patient.id,
                patientName: patient.name,
                room: patient.room,
                bed: patient.bed,
                mealType: mealType,
                rating: reviewData.rating,
                feedback: reviewData.feedback || "", // Đảm bảo có feedback, dù là rỗng
                reviewDate: currentDate,
              });
            }
          });
        }
      } catch (e) {
        console.error(`Lỗi đọc đánh giá cho BN ${patient.id}:`, e);
      }
    });
    setPatientReviews(allReviews.sort((a, b) => b.rating - a.rating)); // Sắp xếp theo đánh giá giảm dần
  };

  useEffect(() => {
    if (selectedMainTab === "reviews") {
      loadPatientReviews();
    }
  }, [selectedMainTab, currentDate, patients]); // Reload reviews when tab, date, or patients list changes

  const getMealTypeNameForDisplay = (mealType) => {
    // ... (giữ nguyên)
    if (mealType === "breakfast") return "Bữa Sáng";
    if (mealType === "lunch") return "Bữa Trưa";
    if (mealType === "dinner") return "Bữa Tối";
    return mealType;
  };

  // Các hàm xử lý khác (approve/reject special request, add new meal, export/import, complete meal) giữ nguyên logic cốt lõi
  // ... (Giữ nguyên các hàm: updateAllKitchenRequestsInStorage, getMealById, getPatientInfo, handleApproveSpecialRequest, handleRejectSpecialRequest, handleAddNewMeal, exportMealData, handleFileUpload, getConfirmedOrdersForDisplay, getAggregatedMealsForPreparation, handleCompleteMeal, isMealCompleted)
  const updateAllKitchenRequestsInStorage = (updatedRequestsList) =>
    localStorage.setItem(
      "kitchenRequests",
      JSON.stringify(updatedRequestsList)
    );

  const getMealById = (mealType, mealId) =>
    meals[mealType]?.find((meal) => meal.id === mealId) || null;

  const getPatientInfo = (
    patientId // Dùng getPatientNameById thay thế nếu chỉ cần tên
  ) =>
    patients.find((p) => p.id === patientId) || {
      name: "N/A",
      room: "N/A",
      bed: "N/A",
    };
  const handleApproveSpecialRequest = (requestToApprove) => {
    try {
      let allRequests = JSON.parse(
        localStorage.getItem("kitchenRequests") || "[]"
      );
      const requestIndex = allRequests.findIndex(
        (req) => req.id === requestToApprove.id
      );
      if (requestIndex !== -1) {
        allRequests[requestIndex].status = "approved";
        updateAllKitchenRequestsInStorage(allRequests);
        const updatedPending = allRequests.filter(
          (req) =>
            req.type === "specialMealRequest" &&
            req.status === "pending" &&
            req.requestDate === currentDate
        );
        setPendingSpecialRequests(updatedPending);
        showNotification(
          `Đã chấp nhận YCĐB của BN ${
            getPatientNameById(allRequests[requestIndex].patientId) // Sử dụng hàm mới
          }`,
          "success"
        );
      }
    } catch (error) {
      showNotification("Lỗi chấp nhận YCĐB", "error");
    }
  };

  const handleRejectSpecialRequest = (requestId) => {
    try {
      let allRequests = JSON.parse(
        localStorage.getItem("kitchenRequests") || "[]"
      );
      const requestIndex = allRequests.findIndex((req) => req.id === requestId);
      if (requestIndex !== -1) {
        allRequests[requestIndex].status = "rejected";
        updateAllKitchenRequestsInStorage(allRequests);
        const updatedPending = allRequests.filter(
          (req) =>
            req.type === "specialMealRequest" &&
            req.status === "pending" &&
            req.requestDate === currentDate
        );
        setPendingSpecialRequests(updatedPending);
        showNotification("Đã từ chối YCĐB", "info");
      }
    } catch (error) {
      showNotification("Lỗi từ chối YCĐB", "error");
    }
  };
  const handleAddNewMeal = () => {
    if (!newMealForm.name || !newMealForm.calories) {
      showNotification("Điền đủ tên món và calories.", "error");
      return;
    }
    const newMealId = `meal-${Date.now()}`;
    const mealToAdd = {
      id: newMealId,
      name: newMealForm.name,
      calories: parseInt(newMealForm.calories) || 0,
      protein: newMealForm.protein || "N/A",
      ingredients: newMealForm.ingredients
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i),
      suitable: newMealForm.suitable
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    };
    const currentMealsForType = meals[selectedMealType] || [];
    if (typeof onUpdateMeal === "function") {
      onUpdateMeal({
        ...meals,
        [selectedMealType]: [...currentMealsForType, mealToAdd],
      });
      setNewMealForm({
        name: "",
        calories: "",
        protein: "",
        ingredients: "",
        suitable: "",
      });
      setShowAddMealForm(false);
      showNotification("Đã thêm món mới!", "success");
    } else {
      showNotification("Lỗi: không thể cập nhật món ăn.", "error");
    }
  };

  const exportMealData = () => {
    const mealData = JSON.stringify(meals, null, 2);
    const blob = new Blob([mealData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `thuc-don-${currentDate.replace(/\//g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Đã xuất dữ liệu thực đơn!", "success");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMeals = JSON.parse(e.target.result);
        if (
          !importedMeals.breakfast ||
          !importedMeals.lunch ||
          !importedMeals.dinner
        ) {
          throw new Error("Format file lỗi.");
        }
        if (typeof onUpdateMeal === "function") {
          onUpdateMeal(importedMeals);
          showNotification("Đã nhập thực đơn!", "success");
        }
      } catch (error) {
        showNotification("Lỗi nhập: " + error.message, "error");
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const getConfirmedOrdersForDisplay = () => {
    const patientMealMap = {};
    try {
      const storedRequests = localStorage.getItem("kitchenRequests");
      if (!storedRequests) return [];
      const allRequests = JSON.parse(storedRequests);

      allRequests
        .filter(
          (req) =>
            req.type === "dailyMenuRequest" &&
            req.status === "patient_submitted" &&
            req.orderDate === currentDate
        )
        .forEach((dailyReq) => {
          const patientInfo = getPatientInfo(dailyReq.patientId);
          patientMealMap[dailyReq.patientId] = {
            id: dailyReq.id,
            patientId: dailyReq.patientId,
            patientName: patientInfo.name,
            room: patientInfo.room,
            bed: patientInfo.bed,
            orderDate: dailyReq.orderDate,
            meals: { ...dailyReq.meals },
          };
        });

      allRequests
        .filter(
          (req) =>
            req.type === "specialMealRequest" &&
            req.status === "approved" &&
            req.requestDate === currentDate
        )
        .forEach((specialReq) => {
          const mealDetail = getMealById(
            specialReq.mealType,
            specialReq.requestedMealId
          );
          if (mealDetail) {
            if (!patientMealMap[specialReq.patientId]) {
              const patientInfo = getPatientInfo(specialReq.patientId);
              patientMealMap[specialReq.patientId] = {
                id: specialReq.id,
                patientId: specialReq.patientId,
                patientName: patientInfo.name,
                room: patientInfo.room,
                bed: patientInfo.bed,
                orderDate: specialReq.requestDate,
                meals: {},
              };
            }
            const pInfo = getPatientInfo(specialReq.patientId);
            patientMealMap[specialReq.patientId].patientName = pInfo.name;
            patientMealMap[specialReq.patientId].room = pInfo.room;
            patientMealMap[specialReq.patientId].bed = pInfo.bed;
            patientMealMap[specialReq.patientId].meals[specialReq.mealType] =
              mealDetail;
          }
        });
      return Object.values(patientMealMap);
    } catch (e) {
      console.error("Lỗi lấy đơn hàng phục vụ:", e);
      return [];
    }
  };
  const finalOrdersForService = getConfirmedOrdersForDisplay();

  const getAggregatedMealsForPreparation = () => {
    const mealCounts = {};
    finalOrdersForService.forEach((order) => {
      Object.values(order.meals || {}).forEach((mealDetail) => {
        if (mealDetail && mealDetail.id) {
          if (mealCounts[mealDetail.id]) {
            mealCounts[mealDetail.id].count++;
          } else {
            mealCounts[mealDetail.id] = { meal: mealDetail, count: 1 };
          }
        }
      });
    });
    return Object.values(mealCounts);
  };
  const aggregatedMealsForPreparation = getAggregatedMealsForPreparation();

  const handleCompleteMeal = (patientId, mealTypeToComplete) => {
    const statusKey = `${patientId}_${mealTypeToComplete}_${currentDate}`;
    const updatedStatus = { ...mealCompletionStatus, [statusKey]: true };
    setMealCompletionStatus(updatedStatus);
    localStorage.setItem(
      `mealCompletionStatus_${currentDate}`,
      JSON.stringify(updatedStatus)
    );

    const orderInfo = finalOrdersForService.find(
      (order) => order.patientId === patientId
    );
    if (orderInfo && orderInfo.meals && orderInfo.meals[mealTypeToComplete]) {
      const completedOrder = {
        id: `completed-${Date.now()}`,
        patientId: patientId,
        patientName: orderInfo.patientName,
        room: orderInfo.room,
        bed: orderInfo.bed,
        mealType: mealTypeToComplete,
        meal: orderInfo.meals[mealTypeToComplete],
        completedDate: currentDate,
        completedTime: new Date().toLocaleTimeString(),
      };

      const existingIndex = completedOrders.findIndex(
        (order) =>
          order.patientId === patientId &&
          order.mealType === mealTypeToComplete &&
          order.completedDate === currentDate
      );
      let newCompletedOrders;
      if (existingIndex !== -1) {
        newCompletedOrders = [...completedOrders];
        newCompletedOrders[existingIndex] = completedOrder;
      } else {
        newCompletedOrders = [...completedOrders, completedOrder];
      }
      setCompletedOrders(newCompletedOrders);
      localStorage.setItem(
        `completedOrders_${currentDate}`,
        JSON.stringify(newCompletedOrders)
      );
    }
    showNotification(
      `BN ${getPatientNameById(patientId)} - ${getMealTypeNameForDisplay(
        mealTypeToComplete
      )}: Đã hoàn thành.`,
      "success"
    );
  };

  const isMealCompleted = (patientId, mealTypeToCheck) =>
    !!mealCompletionStatus[`${patientId}_${mealTypeToCheck}_${currentDate}`];

  const specialRequestsForCurrentTab = pendingSpecialRequests.filter(
    (req) => req.mealType === selectedMealType
  );
  const pendingOrdersForDisplay = finalOrdersForService.filter(
    (order) =>
      order.meals[selectedMealType] &&
      !isMealCompleted(order.patientId, selectedMealType)
  );
  const completedOrdersForCurrentTab = completedOrders.filter(
    (order) =>
      order.mealType === selectedMealType && order.completedDate === currentDate
  );

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          className={`inline-block ${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
      <div className="max-w-screen-xl mx-auto">
        {notification && (
          <div
            className={`fixed top-5 right-5 z-[100] p-3.5 rounded-lg shadow-xl flex items-center ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle size={20} className="mr-2" />
            ) : notification.type === "error" ? (
              <AlertCircle size={20} className="mr-2" />
            ) : (
              <Info size={20} className="mr-2" />
            )}
            <span className="font-semibold text-sm">
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="ml-5 text-white hover:opacity-80"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mb-6">
          <header className="bg-blue-600 text-white p-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Quản lý Bếp</h1>
              <div className="flex items-center mt-1 text-sm opacity-90">
                <Coffee className="h-4 w-4 mr-2" />
                <span>Giao diện Nhân viên Bếp</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {pendingSpecialRequests.length > 0 && (
                <div className="relative">
                  <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg flex items-center text-sm font-medium shadow-md">
                    <BellRing size={16} className="mr-2" />{" "}
                    <span>YC Đặc Biệt ({pendingSpecialRequests.length})</span>
                  </button>
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                    {pendingSpecialRequests.length}
                  </span>
                </div>
              )}
              <button
                onClick={onLogout}
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg flex items-center text-sm font-medium shadow-md"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Đăng xuất
              </button>
            </div>
          </header>

          {/* Main Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-5 px-5" aria-label="Tabs">
              <button
                onClick={() => setSelectedMainTab("service")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedMainTab === "service"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Phục Vụ & Tổng Hợp
              </button>
              <button
                onClick={() => setSelectedMainTab("reviews")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedMainTab === "reviews"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Xem Đánh Giá Bệnh Nhân
                {patientReviews.length > 0 && selectedMainTab !== "reviews" && (
                  <span className="ml-2 px-2 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                    {patientReviews.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          <main className="p-4 sm:p-6">
            {selectedMainTab === "service" && (
              <>
                <section className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-5 border-b border-gray-200 gap-3">
                  <div className="flex items-center text-lg sm:text-xl font-semibold text-gray-700">
                    <Calendar className="h-6 w-6 mr-2.5 text-blue-500" />
                    <span>{currentDate}</span>
                  </div>
                  <div className="flex flex-wrap justify-center sm:justify-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg shadow-sm"
                      title="Nhập thực đơn"
                    >
                      <Upload size={20} />
                    </button>
                    <button
                      onClick={exportMealData}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2.5 rounded-lg shadow-sm"
                      title="Xuất thực đơn"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => setShowAddMealForm((prev) => !prev)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3.5 rounded-lg flex items-center text-sm font-medium shadow-md"
                      title="Thêm món mới"
                    >
                      <FilePlus size={18} className="mr-1.5" />
                      Thêm món
                    </button>
                  </div>
                </section>

                {showAddMealForm && (
                  <section className="bg-indigo-50 rounded-lg p-5 mb-6 shadow-md border border-indigo-100">
                    <div className="flex justify-between items-center mb-3.5">
                      <h3 className="text-lg font-semibold text-indigo-700">
                        Thêm món mới vào{" "}
                        <span className="font-bold">
                          {getMealTypeNameForDisplay(selectedMealType)}
                        </span>
                      </h3>
                      <button
                        onClick={() => setShowAddMealForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 text-sm">
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          Tên món ăn*
                        </label>
                        <input
                          type="text"
                          value={newMealForm.name}
                          onChange={(e) =>
                            setNewMealForm({
                              ...newMealForm,
                              name: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          Calories (kcal)*
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
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          Protein (g)
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
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-gray-700 mb-1">
                          Phù hợp (cách bởi ',')
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
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-medium text-gray-700 mb-1">
                          Thành phần (cách bởi ',')
                        </label>
                        <textarea
                          value={newMealForm.ingredients}
                          onChange={(e) =>
                            setNewMealForm({
                              ...newMealForm,
                              ingredients: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                          rows="2"
                        ></textarea>
                      </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={handleAddNewMeal}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-5 rounded-lg flex items-center text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Save size={16} className="mr-2" />
                        Lưu món ăn
                      </button>
                    </div>
                  </section>
                )}

                <section>
                  <div className="mb-5 border-b border-gray-300">
                    <nav
                      className="-mb-px flex space-x-1 sm:space-x-2"
                      aria-label="Meal Tabs"
                    >
                      {["breakfast", "lunch", "dinner"].map((mealType) => (
                        <button
                          key={mealType}
                          onClick={() => setSelectedMealType(mealType)}
                          className={`flex-1 sm:flex-initial whitespace-nowrap py-3.5 px-4 sm:px-6 border-b-2 font-semibold text-sm focus:outline-none transition-colors duration-150
                        ${
                          selectedMealType === mealType
                            ? "border-blue-500 text-blue-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        >
                          {getMealTypeNameForDisplay(mealType)}
                          {pendingSpecialRequests.filter(
                            (req) => req.mealType === mealType
                          ).length > 0 && (
                            <span className="ml-2 inline-block px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full animate-bounce">
                              {
                                pendingSpecialRequests.filter(
                                  (req) => req.mealType === mealType
                                ).length
                              }
                            </span>
                          )}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3.5 flex items-center">
                        <Soup size={22} className="mr-2 text-orange-500" /> YC
                        Đặc Biệt ({getMealTypeNameForDisplay(selectedMealType)})
                        ({specialRequestsForCurrentTab.length})
                      </h3>
                      {specialRequestsForCurrentTab.length > 0 ? (
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                          {specialRequestsForCurrentTab.map((req) => (
                            <div
                              key={req.id}
                              className="border border-orange-200 bg-orange-50 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                <div>
                                  <p className="font-semibold text-orange-800">
                                    {getPatientNameById(req.patientId)}{" "}
                                    <span className="text-xs text-gray-500">
                                      ({req.patientId})
                                    </span>
                                  </p>
                                  <p className="text-sm mt-0.5">
                                    YC:{" "}
                                    <span className="font-medium">
                                      {req.requestedMealName}
                                    </span>
                                  </p>
                                  <p className="text-xs italic text-gray-600 mt-1">
                                    Lý do: {req.reason || "Không rõ"}
                                  </p>
                                </div>
                                <div className="flex space-x-2 self-start sm:self-center mt-2 sm:mt-0">
                                  <button
                                    onClick={() =>
                                      handleApproveSpecialRequest(req)
                                    }
                                    className="bg-green-100 hover:bg-green-200 text-green-700 py-1 px-3 rounded-md text-xs font-medium flex items-center shadow-sm"
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    Ok
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleRejectSpecialRequest(req.id)
                                    }
                                    className="bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded-md text-xs font-medium flex items-center shadow-sm"
                                  >
                                    <XCircle size={14} className="mr-1" />
                                    Từ chối
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic py-3">
                          Không có yêu cầu nào.
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3.5 flex items-center">
                        <UserCheck
                          size={24}
                          className="mr-2.5 text-green-600"
                        />{" "}
                        Phục vụ {getMealTypeNameForDisplay(selectedMealType)} (
                        {currentDate})
                      </h3>
                      {pendingOrdersForDisplay.length === 0 ? (
                        <p className="text-sm text-gray-500 italic py-3">
                          Không có bệnh nhân nào cần phục vụ cho{" "}
                          {getMealTypeNameForDisplay(
                            selectedMealType
                          ).toLowerCase()}{" "}
                          hôm nay.
                        </p>
                      ) : (
                        <div className="overflow-x-auto max-h-[450px] custom-scrollbar border rounded-lg shadow-sm">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-200 sticky top-0">
                              <tr>
                                {[
                                  "Mã BN",
                                  "Họ tên",
                                  "P/G",
                                  "Món ăn",
                                  "Thao tác",
                                ].map((h) => (
                                  <th
                                    key={h}
                                    className="py-2.5 px-3 text-left font-semibold text-gray-600 whitespace-nowrap"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {pendingOrdersForDisplay.map((order) => {
                                const mealForCurrentSession =
                                  order.meals?.[selectedMealType];
                                if (!mealForCurrentSession) return null;
                                return (
                                  <tr
                                    key={order.id + "_" + selectedMealType}
                                    className="hover:bg-gray-50 transition-colors"
                                  >
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      {order.patientId}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                                      {order.patientName}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      {order.room}/{order.bed}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {mealForCurrentSession.name}{" "}
                                      <span className="text-xs text-gray-500">
                                        ({mealForCurrentSession.calories} kcal)
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                      <button
                                        onClick={() =>
                                          handleCompleteMeal(
                                            order.patientId,
                                            selectedMealType
                                          )
                                        }
                                        className="w-auto text-xs py-1.5 px-3 rounded-md flex items-center justify-center mx-auto shadow-sm bg-green-600 text-white hover:bg-green-700"
                                      >
                                        <CheckCircle
                                          size={14}
                                          className="mr-1.5"
                                        />
                                        Hoàn thành
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="mt-8 bg-green-50 rounded-xl p-5 shadow-md border border-green-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <PackageCheck size={22} className="mr-2.5 text-green-600" />
                    Suất đã hoàn thành -{" "}
                    {getMealTypeNameForDisplay(selectedMealType)} (
                    {completedOrdersForCurrentTab.length})
                  </h2>
                  {completedOrdersForCurrentTab.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-3">
                      Chưa có suất nào được hoàn thành cho{" "}
                      {getMealTypeNameForDisplay(
                        selectedMealType
                      ).toLowerCase()}
                      .
                    </p>
                  ) : (
                    <div className="overflow-x-auto max-h-[350px] custom-scrollbar border rounded-lg shadow-sm bg-white">
                      <table className="min-w-full text-sm">
                        <thead className="bg-green-100 sticky top-0">
                          <tr>
                            {[
                              "Mã BN",
                              "Họ tên",
                              "P/G",
                              "Món ăn",
                              "Thời gian hoàn thành",
                            ].map((h) => (
                              <th
                                key={h}
                                className="py-2.5 px-3 text-left font-semibold text-gray-700 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {completedOrdersForCurrentTab.map((order) => (
                            <tr
                              key={order.id}
                              className="hover:bg-green-50 transition-colors"
                            >
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {order.patientId}
                              </td>
                              <td className="py-2.5 px-3 font-medium whitespace-nowrap">
                                {order.patientName}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {order.room}/{order.bed}
                              </td>
                              <td className="py-2.5 px-3">
                                {order.meal.name}{" "}
                                <span className="text-xs text-gray-500">
                                  ({order.meal.calories} kcal)
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap text-xs text-gray-500">
                                {order.completedTime}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="bg-gray-50 rounded-xl p-5 mt-8 shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <ClipboardList size={22} className="mr-2.5 text-blue-600" />
                    Tổng hợp thực phẩm (Cả ngày)
                  </h2>
                  {aggregatedMealsForPreparation.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      Chưa có món ăn nào được đặt.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-200">
                          <tr>
                            {[
                              "Món ăn",
                              "Số lượng",
                              "Nguyên liệu",
                              "Thao tác",
                            ].map((h) => (
                              <th
                                key={h}
                                className="py-2.5 px-3 text-left font-semibold text-gray-600 whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {aggregatedMealsForPreparation.map((item) => (
                            <tr
                              key={item.meal.id}
                              className="hover:bg-gray-100 transition-colors"
                            >
                              <td className="py-2.5 px-3">
                                <div className="font-medium">
                                  {item.meal.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.meal.calories} kcal
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-medium">
                                {item.count}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {item.meal.ingredients.map((ing) => (
                                    <span
                                      key={ing}
                                      className="text-xs bg-gray-200 px-2 py-1 rounded-full shadow-sm"
                                    >
                                      {ing}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1.5 px-3 rounded-md flex items-center justify-center mx-auto font-medium shadow-sm">
                                  <FileText size={14} className="mr-1.5" />
                                  In CT
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}

            {selectedMainTab === "reviews" && (
              <section>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Eye size={24} className="mr-2.5 text-purple-600" />
                  Đánh giá của bệnh nhân ({currentDate})
                </h2>
                {patientReviews.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4 text-center">
                    Chưa có đánh giá nào từ bệnh nhân cho ngày này.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {patientReviews.map((review, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                          <div>
                            <p className="font-semibold text-purple-700">
                              {review.patientName}{" "}
                              <span className="text-xs text-gray-500">
                                ({review.patientId})
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">
                              Phòng: {review.room} - Giường: {review.bed}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 sm:mt-0">
                            Bữa:{" "}
                            <span className="font-medium text-gray-700">
                              {getMealTypeNameForDisplay(review.mealType)}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium mr-2">
                            Đánh giá:
                          </span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-xs font-semibold text-gray-700">
                              ({review.rating}/5 sao)
                            </span>
                          </div>
                        </div>
                        {review.feedback && (
                          <div>
                            <p className="text-sm font-medium mb-1">Góp ý:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-md border border-gray-100 whitespace-pre-wrap">
                              {review.feedback}
                            </p>
                          </div>
                        )}
                        {!review.feedback && (
                          <p className="text-sm text-gray-500 italic">
                            (Không có góp ý chi tiết)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
