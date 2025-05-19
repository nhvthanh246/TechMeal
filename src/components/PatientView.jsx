// PatientView.js
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Check,
  User,
  LogOut,
  Pill,
  AlertCircle,
  X,
  MessageCircle,
  Send,
  Info,
  Download,
  ChevronDown,
  ChevronUp,
  Star,
  MessageSquareText, // Icon cho góp ý
} from "lucide-react";

// Component RatingInput được cải tiến
function RatingInput({
  currentRatingData,
  onSubmitRating,
  mealType,
  isSubmitting,
}) {
  const ratings = [
    {
      value: 1,
      label: "Rất tệ",
      color: "text-red-500",
      fillColor: "fill-red-500",
      hoverColor: "hover:text-red-600",
    },
    {
      value: 2,
      label: "Tệ",
      color: "text-orange-500",
      fillColor: "fill-orange-500",
      hoverColor: "hover:text-orange-600",
    },
    {
      value: 3,
      label: "Bình thường",
      color: "text-yellow-500",
      fillColor: "fill-yellow-500",
      hoverColor: "hover:text-yellow-600",
    },
    {
      value: 4,
      label: "Ngon",
      color: "text-lime-500",
      fillColor: "fill-lime-500",
      hoverColor: "hover:text-lime-600",
    },
    {
      value: 5,
      label: "Rất ngon",
      color: "text-green-500",
      fillColor: "fill-green-500",
      hoverColor: "hover:text-green-600",
    },
  ];

  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(
    currentRatingData?.rating || 0
  );
  const [feedbackText, setFeedbackText] = useState(
    currentRatingData?.feedback || ""
  );

  useEffect(() => {
    setSelectedRating(currentRatingData?.rating || 0);
    setFeedbackText(currentRatingData?.feedback || "");
  }, [currentRatingData]);

  const handleStarClick = (ratingValue) => {
    setSelectedRating(ratingValue);
  };

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmitRating(mealType, selectedRating, feedbackText);
    } else {
      // Có thể thêm thông báo yêu cầu chọn sao nếu cần
      alert("Vui lòng chọn số sao đánh giá.");
    }
  };

  // Nếu đã có đánh giá (và không cho sửa nữa sau khi submit)
  // Để đơn giản, nếu currentRatingData.rating có giá trị, coi như đã submit và không cho sửa.
  // Nếu muốn cho sửa, cần logic phức tạp hơn.
  if (currentRatingData?.rating && !isSubmitting) {
    // Kiểm tra isSubmitting để tránh ẩn form ngay khi bấm submit
    const selectedRatingInfo = ratings.find(
      (r) => r.value === currentRatingData.rating
    );
    return (
      <div className="mt-4 text-sm text-center">
        <p className="font-medium text-gray-700 mb-1">Bạn đã đánh giá:</p>
        <div className="flex items-center justify-center">
          {ratings.map((r) => (
            <Star
              key={r.value}
              size={26}
              className={`mx-0.5 ${
                currentRatingData.rating >= r.value
                  ? `${selectedRatingInfo?.color || "text-gray-400"} ${
                      selectedRatingInfo?.fillColor || "fill-gray-400"
                    }`
                  : "text-gray-300"
              }`}
            />
          ))}
          {selectedRatingInfo && (
            <span className={`ml-2 font-semibold ${selectedRatingInfo.color}`}>
              {selectedRatingInfo.label}
            </span>
          )}
        </div>
        {currentRatingData.feedback && (
          <div className="mt-2 text-left bg-gray-50 p-2 rounded-md border border-gray-200">
            <p className="font-medium text-xs text-gray-600">Góp ý của bạn:</p>
            <p className="text-xs text-gray-800 italic whitespace-pre-wrap">
              {currentRatingData.feedback}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Nếu chưa đánh giá hoặc đang trong quá trình submit (để form không bị ẩn vội)
  return (
    <div className="mt-4 text-sm">
      <p className="font-medium text-gray-700 mb-2 text-center">
        Đánh giá chất lượng bữa ăn:
      </p>
      <div className="flex justify-center items-center space-x-1.5 my-2">
        {ratings.map((ratingOption) => (
          <button
            key={ratingOption.value}
            onClick={() => handleStarClick(ratingOption.value)}
            onMouseEnter={() => setHoverRating(ratingOption.value)}
            onMouseLeave={() => setHoverRating(0)}
            className={`p-1 rounded-full transition-transform duration-150 ease-in-out hover:scale-110 focus:outline-none`}
            title={ratingOption.label}
          >
            <Star
              size={30}
              className={`transition-colors duration-150 
                ${
                  (hoverRating || selectedRating) >= ratingOption.value
                    ? `${ratings[(hoverRating || selectedRating) - 1].color} ${
                        ratings[(hoverRating || selectedRating) - 1].fillColor
                      }`
                    : "text-gray-300"
                }
              `}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-600 h-5 mt-1 font-medium">
        {(hoverRating > 0 && ratings[hoverRating - 1]?.label) ||
          (selectedRating > 0 && ratings[selectedRating - 1]?.label) ||
          "Hãy chọn mức đánh giá của bạn"}
      </p>

      <div className="mt-3">
        <label
          htmlFor={`feedback-${mealType}`}
          className="block text-xs font-medium text-gray-600 mb-1 text-center"
        >
          Góp ý thêm cho nhà bếp (không bắt buộc):
        </label>
        <textarea
          id={`feedback-${mealType}`}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          rows="2"
          className="w-full p-2 border border-gray-300 rounded-md text-xs focus:ring-purple-500 focus:border-purple-500"
          placeholder="Nhập góp ý của bạn ở đây..."
        />
      </div>
      <div className="mt-3 flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={selectedRating === 0} // Chỉ cho phép gửi khi đã chọn sao
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1.5 px-4 rounded-md flex items-center disabled:opacity-50"
        >
          <Send size={14} className="mr-1.5" />
          Gửi đánh giá & Góp ý
        </button>
      </div>
    </div>
  );
}

function MealSection({
  title,
  icon,
  timeLabel,
  meals,
  selectedMeal,
  onSelectMeal,
  isCompletedByKitchen,
  mealType,
  onRequestSpecial,
  currentRatingData, // Đổi tên từ currentRating để chứa cả feedback
  onRateMeal,
}) {
  const [expanded, setExpanded] = useState(true);
  // State để quản lý việc đang submit, tránh ẩn form ngay lập tức
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const handleSubmitRatingWithFeedback = (mealType, rating, feedback) => {
    setIsSubmittingRating(true);
    onRateMeal(mealType, rating, feedback);
    // Không setIsSubmittingRating(false) ở đây vì PatientView sẽ re-render
    // và currentRatingData sẽ được cập nhật, tự động chuyển sang view "đã đánh giá".
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden shadow-sm ${
        isCompletedByKitchen && !currentRatingData?.rating && expanded
          ? "bg-white"
          : isCompletedByKitchen
          ? "bg-slate-100 opacity-90"
          : "bg-white"
      }`}
    >
      <div
        className={`p-3 flex justify-between items-center ${
          isCompletedByKitchen ? "bg-slate-200" : "bg-gray-50"
        }`}
      >
        <div className="flex items-center">
          {icon}
          <h3 className="font-semibold text-gray-800 ml-2">{title}</h3>
          <span className="ml-3 text-xs text-gray-500">{timeLabel}</span>
        </div>
        <div className="flex items-center">
          {selectedMeal && !isCompletedByKitchen && (
            <span
              className={`mr-3 text-xs py-1 px-2 rounded-full flex items-center bg-green-100 text-green-800`}
            >
              <Check className="h-3 w-3 mr-1" />
              Đã chọn
            </span>
          )}
          {isCompletedByKitchen && (
            <span className="text-xs font-semibold text-green-700 bg-green-200 px-2.5 py-1 rounded-full flex items-center">
              <Check size={14} className="mr-1" />
              Bếp đã xong
            </span>
          )}
          {isCompletedByKitchen && currentRatingData?.rating && (
            <span className="ml-2 text-xs font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full flex items-center">
              <Star size={14} className="mr-1 fill-current text-purple-500" />
              Đã đánh giá
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-1 rounded-full ml-2 ${"bg-gray-200 hover:bg-gray-300 text-gray-500"}`}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {expanded && !isCompletedByKitchen && (
        // ... (phần chọn món giữ nguyên)
        <div className="p-4">
          {meals && meals.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className={`border rounded-lg p-3 transition-all duration-150 ease-in-out transform hover:scale-[1.02] hover:shadow-md
                    ${
                      selectedMeal?.id === meal.id
                        ? "border-purple-500 bg-purple-50 ring-2 ring-purple-300"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start mb-1.5">
                      <div
                        className={`flex-shrink-0 w-5 h-5 mt-0.5 mr-2 rounded-full border-2 flex items-center justify-center ${
                          selectedMeal?.id === meal.id
                            ? "bg-purple-500 border-purple-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedMeal?.id === meal.id && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <h4 className="font-medium text-gray-800 text-sm leading-tight">
                        {meal.name}
                      </h4>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      <span>{meal.calories} kcal</span>
                      {meal.protein && (
                        <span className="ml-2">P: {meal.protein}</span>
                      )}
                    </div>
                    {meal.suitable && meal.suitable.length > 0 && (
                      <div className="my-1.5 flex flex-wrap gap-1">
                        {meal.suitable.map((c) => (
                          <span
                            key={c}
                            className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center"
                          >
                            <Pill size={10} className="mr-0.5" />
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => onSelectMeal(meal)}
                      disabled={isCompletedByKitchen}
                      className={`mt-2.5 w-full py-1.5 px-2 rounded-md text-xs font-medium transition-colors shadow-sm
                          ${
                            selectedMeal?.id === meal.id
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          } ${
                        isCompletedByKitchen
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      {selectedMeal?.id === meal.id
                        ? "Hủy chọn"
                        : "Chọn món này"}
                    </button>
                  </div>
                ))}
              </div>
              {!isCompletedByKitchen && (
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={onRequestSpecial}
                    disabled={isCompletedByKitchen}
                    className={`text-purple-600 hover:text-purple-800 text-sm flex items-center font-medium ${
                      isCompletedByKitchen
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 mr-1.5" />
                    Yêu cầu món khác?
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center py-4 text-sm text-gray-500">
              Không có món ăn gợi ý cho buổi này.
            </p>
          )}
        </div>
      )}
      {expanded && isCompletedByKitchen && (
        <div className="p-4">
          {selectedMeal && (
            <div className="mb-3 p-3 bg-gray-100 rounded-md text-sm">
              <p className="font-medium text-gray-800">
                Món ăn đã được phục vụ:
              </p>
              <p className="text-gray-700">
                {selectedMeal.name} ({selectedMeal.calories} kcal)
              </p>
            </div>
          )}
          <RatingInput
            currentRatingData={currentRatingData}
            onSubmitRating={handleSubmitRatingWithFeedback}
            mealType={mealType}
            isSubmitting={isSubmittingRating}
          />
          {!selectedMeal && !currentRatingData?.rating && (
            <p className="mt-3 text-sm text-center text-gray-500 italic">
              Bếp đã chuẩn bị xong bữa này.{" "}
              {selectedMeal ? "" : "Bạn không chọn món nào cho bữa này."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
export function PatientView({ patients, meals, onLogout, currentDate }) {
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: null,
    lunch: null,
    dinner: null,
  });
  const [dailyOrderSentByPatient, setDailyOrderSentByPatient] = useState(false);

  const [kitchenMealCompletion, setKitchenMealCompletion] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  // Cấu trúc mealRatings giờ bao gồm rating và feedback
  const [mealRatings, setMealRatings] = useState({
    breakfast: { rating: null, feedback: "" },
    lunch: { rating: null, feedback: "" },
    dinner: { rating: null, feedback: "" },
  });

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    mealType: "breakfast",
    requestedMealId: "",
    requestedMealName: "",
    reason: "",
  });
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "info", duration = 3500) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  const getMealTypeName = (mealType) => {
    if (mealType === "breakfast") return "Bữa Sáng";
    if (mealType === "lunch") return "Bữa Trưa";
    if (mealType === "dinner") return "Bữa Tối";
    return mealType;
  };

  const loadKitchenMealCompletionStatus = (currentPatient, date) => {
    if (!currentPatient || !date) return;
    try {
      const statusKey = `mealCompletionStatus_${date}`;
      const storedDayStatus = localStorage.getItem(statusKey);
      const defaultCompletion = {
        breakfast: false,
        lunch: false,
        dinner: false,
      };
      if (storedDayStatus) {
        const allStatusesForDay = JSON.parse(storedDayStatus);
        setKitchenMealCompletion({
          breakfast:
            !!allStatusesForDay[`${currentPatient.id}_breakfast_${date}`],
          lunch: !!allStatusesForDay[`${currentPatient.id}_lunch_${date}`],
          dinner: !!allStatusesForDay[`${currentPatient.id}_dinner_${date}`],
        });
      } else {
        setKitchenMealCompletion(defaultCompletion);
      }
    } catch (e) {
      console.error("Lỗi đọc trạng thái hoàn thành từ bếp:", e);
      setKitchenMealCompletion({
        breakfast: false,
        lunch: false,
        dinner: false,
      });
    }
  };

  const loadMealRatings = (currentPatient, date) => {
    if (!currentPatient || !date) return;
    const defaultRatings = {
      breakfast: { rating: null, feedback: "" },
      lunch: { rating: null, feedback: "" },
      dinner: { rating: null, feedback: "" },
    };
    try {
      const ratingsKey = `mealRatings_${currentPatient.id}_${date}`;
      const storedRatings = localStorage.getItem(ratingsKey);
      if (storedRatings) {
        const parsedRatings = JSON.parse(storedRatings);
        // Đảm bảo cấu trúc dữ liệu đúng, có cả rating và feedback
        const validRatings = {};
        for (const mealType of ["breakfast", "lunch", "dinner"]) {
          validRatings[mealType] = {
            rating: parsedRatings[mealType]?.rating || null,
            feedback: parsedRatings[mealType]?.feedback || "",
          };
        }
        setMealRatings(validRatings);
      } else {
        setMealRatings(defaultRatings);
      }
    } catch (e) {
      console.error("Lỗi đọc đánh giá bữa ăn từ localStorage:", e);
      setMealRatings(defaultRatings);
    }
  };

  const handlePatientLogin = (e) => {
    e.preventDefault();
    const patient = patients.find(
      (p) =>
        p.id.toLowerCase() === patientId.toLowerCase() &&
        p.name.toLowerCase() === patientName.toLowerCase()
    );

    if (patient) {
      setPatientData(patient);
      setShowResults(true);
      setError("");
      setDailyOrderSentByPatient(false);

      try {
        const storedRequests = localStorage.getItem("kitchenRequests");
        if (storedRequests) {
          const allRequests = JSON.parse(storedRequests);
          const existingOrder = allRequests.find(
            (req) =>
              req.type === "dailyMenuRequest" &&
              req.patientId === patient.id &&
              req.orderDate === currentDate
          );
          if (existingOrder) {
            setSelectedMeals(
              existingOrder.meals || {
                breakfast: null,
                lunch: null,
                dinner: null,
              }
            );
            setDailyOrderSentByPatient(true);
          } else {
            setSelectedMeals({ breakfast: null, lunch: null, dinner: null });
          }
        } else {
          setSelectedMeals({ breakfast: null, lunch: null, dinner: null });
        }
      } catch (err) {
        console.error("Lỗi kiểm tra đơn hàng cũ:", err);
        setSelectedMeals({ breakfast: null, lunch: null, dinner: null });
      }
      loadKitchenMealCompletionStatus(patient, currentDate);
      loadMealRatings(patient, currentDate);
    } else {
      setError("Thông tin bệnh nhân không chính xác. Vui lòng kiểm tra lại.");
      setShowResults(false);
    }
  };

  useEffect(() => {
    if (patientData && showResults) {
      loadKitchenMealCompletionStatus(patientData, currentDate);
      loadMealRatings(patientData, currentDate);
      const intervalId = setInterval(() => {
        loadKitchenMealCompletionStatus(patientData, currentDate);
        // Không cần load lại mealRatings thường xuyên trừ khi có cơ chế server push
        // loadMealRatings(patientData, currentDate);
      }, 5000); // Chỉ load kitchen status
      return () => clearInterval(intervalId);
    }
  }, [patientData, currentDate, showResults]);

  // Cập nhật hàm xử lý đánh giá để bao gồm cả feedback
  const handleRateMeal = (mealType, ratingValue, feedbackText) => {
    if (!patientData) return;

    const ratingLabels = {
      1: "Rất tệ",
      2: "Tệ",
      3: "Bình thường",
      4: "Ngon",
      5: "Rất ngon",
    };
    const newMealRatingsData = {
      ...mealRatings,
      [mealType]: { rating: ratingValue, feedback: feedbackText.trim() },
    };
    setMealRatings(newMealRatingsData);

    try {
      const ratingsKey = `mealRatings_${patientData.id}_${currentDate}`;
      localStorage.setItem(ratingsKey, JSON.stringify(newMealRatingsData));

      let notificationMessage = `Đã đánh giá bữa ${getMealTypeName(
        mealType
      ).toLowerCase()} là "${ratingLabels[ratingValue] || ratingValue}".`;
      if (feedbackText.trim()) {
        notificationMessage += " Cảm ơn bạn đã góp ý!";
      }
      showNotification(notificationMessage, "success");
    } catch (error) {
      showNotification("Lỗi khi lưu đánh giá: " + error.message, "error");
    }
  };

  const getRecommendedMeals = () => {
    // ... (giữ nguyên)
    if (!patientData) return null;
    const patientConditions = patientData.conditions;
    const recommendedMeals = { breakfast: [], lunch: [], dinner: [] };
    Object.keys(meals).forEach((mealType) => {
      recommendedMeals[mealType] = meals[mealType]
        .filter((meal) => {
          if (patientConditions.length === 0) return true;
          return patientConditions.some((condition) =>
            meal.suitable.includes(condition)
          );
        })
        .sort((a, b) => {
          const aMatchCount = patientConditions.filter((c) =>
            a.suitable.includes(c)
          ).length;
          const bMatchCount = patientConditions.filter((c) =>
            b.suitable.includes(c)
          ).length;
          return bMatchCount - aMatchCount;
        });
    });
    return recommendedMeals;
  };

  const handleSelectMeal = (mealType, meal) => {
    // ... (giữ nguyên)
    if (kitchenMealCompletion[mealType]) {
      showNotification(
        `Bữa ${getMealTypeName(
          mealType
        ).toLowerCase()} đã được bếp chuẩn bị xong, không thể chọn lại.`,
        "error"
      );
      return;
    }

    if (selectedMeals[mealType]?.id === meal.id) {
      setSelectedMeals({ ...selectedMeals, [mealType]: null });
      showNotification(
        `Đã hủy chọn món ${meal.name} cho ${getMealTypeName(
          mealType
        ).toLowerCase()}.`,
        "info"
      );
    } else {
      setSelectedMeals({ ...selectedMeals, [mealType]: meal });
      showNotification(
        `Đã chọn món ${meal.name} cho ${getMealTypeName(
          mealType
        ).toLowerCase()}.`,
        "success"
      );
    }
  };

  const handleOpenRequestForm = (mealType) => {
    // ... (giữ nguyên)
    if (kitchenMealCompletion[mealType]) {
      showNotification(
        `Bữa ${getMealTypeName(
          mealType
        ).toLowerCase()} đã được bếp chuẩn bị xong, không thể yêu cầu món đặc biệt.`,
        "error"
      );
      return;
    }
    setRequestForm({
      mealType,
      requestedMealId: "",
      requestedMealName: "",
      reason: "",
    });
    setShowRequestForm(true);
  };
  const handleCloseRequestForm = () => setShowRequestForm(false);
  const handleSelectRequestedMeal = (meal) =>
    setRequestForm({
      ...requestForm,
      requestedMealId: meal.id,
      requestedMealName: meal.name,
    });

  const handleSubmitRequest = () => {
    // ... (giữ nguyên)
    const mealType = requestForm.mealType;
    if (kitchenMealCompletion[mealType]) {
      showNotification(
        `Bữa ${getMealTypeName(
          mealType
        ).toLowerCase()} đã được bếp chuẩn bị xong, không thể gửi yêu cầu.`,
        "error"
      );
      return;
    }
    if (!requestForm.requestedMealId || !requestForm.reason) {
      showNotification("Vui lòng chọn món và nhập lý do.", "error");
      return;
    }
    const mealRequest = {
      type: "specialMealRequest",
      id: `req-${Date.now()}`,
      patientId: patientData.id,
      patientName: patientData.name,
      mealType: requestForm.mealType,
      requestedMealId: requestForm.requestedMealId,
      requestedMealName: requestForm.requestedMealName,
      requestDate: currentDate,
      reason: requestForm.reason,
      status: "pending",
    };
    try {
      let allRequests = JSON.parse(
        localStorage.getItem("kitchenRequests") || "[]"
      );
      allRequests = allRequests.filter(
        (req) =>
          !(
            req.type === "specialMealRequest" &&
            req.patientId === patientData.id &&
            req.mealType === requestForm.mealType &&
            req.requestDate === currentDate &&
            req.status === "pending"
          )
      );
      allRequests.push(mealRequest);
      localStorage.setItem("kitchenRequests", JSON.stringify(allRequests));
      showNotification(
        `Yêu cầu món đặc biệt cho bữa ${getMealTypeName(
          requestForm.mealType
        ).toLowerCase()} đã được gửi.`,
        "success"
      );
      setShowRequestForm(false);
      setRequestForm({
        mealType: "breakfast",
        requestedMealId: "",
        requestedMealName: "",
        reason: "",
      });
    } catch (error) {
      showNotification("Lỗi gửi YCĐB: " + error.message, "error");
    }
  };

  const handleSubmitOrder = () => {
    // ... (giữ nguyên)
    const hasSelectedAtLeastOneNotCompletedMeal = Object.keys(
      selectedMeals
    ).some((mt) => selectedMeals[mt] !== null && !kitchenMealCompletion[mt]);

    const allSelectedMealsAreCompleted = Object.keys(selectedMeals).every(
      (mt) => selectedMeals[mt] === null || kitchenMealCompletion[mt]
    );

    if (
      allSelectedMealsAreCompleted &&
      Object.values(selectedMeals).some((m) => m !== null)
    ) {
      showNotification(
        "Tất cả các món bạn chọn đã được bếp chuẩn bị xong. Không có gì để cập nhật.",
        "warning"
      );
      return;
    }

    if (!hasSelectedAtLeastOneNotCompletedMeal && !dailyOrderSentByPatient) {
      const anyMealSelected = Object.values(selectedMeals).some(
        (m) => m !== null
      );
      if (!anyMealSelected) {
        showNotification(
          "Vui lòng chọn ít nhất một món ăn cho các buổi chưa hoàn thành.",
          "error"
        );
        return;
      }
    }

    try {
      let allRequests = JSON.parse(
        localStorage.getItem("kitchenRequests") || "[]"
      );
      const existingOrderIndex = allRequests.findIndex(
        (req) =>
          req.type === "dailyMenuRequest" &&
          req.patientId === patientData.id &&
          req.orderDate === currentDate
      );

      let finalMealsToSend = { ...selectedMeals };
      let notificationForSkippedUpdates = "";

      if (existingOrderIndex !== -1) {
        const previouslySubmittedMeals =
          allRequests[existingOrderIndex].meals || {};
        for (const mealType of ["breakfast", "lunch", "dinner"]) {
          if (kitchenMealCompletion[mealType]) {
            if (previouslySubmittedMeals[mealType]) {
              finalMealsToSend[mealType] = previouslySubmittedMeals[mealType];
            } else {
              finalMealsToSend[mealType] = null;
            }
            if (
              selectedMeals[mealType] &&
              selectedMeals[mealType]?.id !== finalMealsToSend[mealType]?.id
            ) {
              notificationForSkippedUpdates += `Lựa chọn cho bữa ${getMealTypeName(
                mealType
              ).toLowerCase()} không được cập nhật vì bếp đã xong. `;
            }
          }
        }
      }

      const isAnyMealActuallySelected = Object.values(finalMealsToSend).some(
        (m) => m !== null
      );
      if (!isAnyMealActuallySelected && !dailyOrderSentByPatient) {
        showNotification("Vui lòng chọn ít nhất một món ăn.", "error");
        return;
      }

      const order = {
        type: "dailyMenuRequest",
        patientId: patientData.id,
        patientName: patientData.name,
        room: patientData.room,
        bed: patientData.bed,
        orderDate: currentDate,
        meals: finalMealsToSend,
        status: "patient_submitted",
        id:
          existingOrderIndex !== -1
            ? allRequests[existingOrderIndex].id
            : `dailyReq-${patientData.id}-${Date.now()}`,
      };

      if (existingOrderIndex !== -1) {
        allRequests[existingOrderIndex] = order;
      } else {
        allRequests.push(order);
      }
      localStorage.setItem("kitchenRequests", JSON.stringify(allRequests));

      setSelectedMeals(finalMealsToSend);
      setDailyOrderSentByPatient(true);
      showNotification(
        "Thực đơn ngày đã được gửi/cập nhật!" +
          (notificationForSkippedUpdates
            ? ` (${notificationForSkippedUpdates.trim()})`
            : ""),
        "success",
        notificationForSkippedUpdates ? 6000 : 3500
      );
    } catch (error) {
      showNotification("Lỗi gửi thực đơn: " + error.message, "error");
    }
  };

  const handleResetOrder = () => {
    // ... (giữ nguyên)
    let canReset = true;
    let existingOrderMeals = null;
    try {
      const storedRequests = localStorage.getItem("kitchenRequests");
      if (storedRequests) {
        const allRequests = JSON.parse(storedRequests);
        const existingOrder = allRequests.find(
          (req) =>
            req.type === "dailyMenuRequest" &&
            req.patientId === patientData.id &&
            req.orderDate === currentDate
        );
        if (existingOrder) existingOrderMeals = existingOrder.meals;
      }
    } catch (e) {
      console.error(e);
    }

    if (existingOrderMeals) {
      for (const mealType of ["breakfast", "lunch", "dinner"]) {
        if (existingOrderMeals[mealType] && kitchenMealCompletion[mealType]) {
          canReset = false;
          showNotification(
            `Không thể đặt lại toàn bộ vì bữa ${getMealTypeName(
              mealType
            ).toLowerCase()} đã được bếp chuẩn bị xong.`,
            "error"
          );
          break;
        }
      }
    }

    if (!canReset) return;

    try {
      let allRequests = JSON.parse(
        localStorage.getItem("kitchenRequests") || "[]"
      );
      const initialLength = allRequests.length;
      allRequests = allRequests.filter(
        (req) =>
          !(
            req.type === "dailyMenuRequest" &&
            req.patientId === patientData.id &&
            req.orderDate === currentDate
          )
      );
      if (
        allRequests.length < initialLength ||
        !localStorage.getItem("kitchenRequests")
      ) {
        localStorage.setItem("kitchenRequests", JSON.stringify(allRequests));
      }
    } catch (error) {
      console.error("Error resetting order from LS:", error);
    }

    setSelectedMeals({ breakfast: null, lunch: null, dinner: null });
    setDailyOrderSentByPatient(false);
    showNotification(
      "Đã xóa lựa chọn thực đơn ngày. Bạn có thể chọn lại.",
      "info"
    );
  };

  const recommendedMeals = getRecommendedMeals();
  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {notification && (
          // ... (thông báo giữ nguyên)
          <div
            className={`fixed top-4 right-4 z-[100] p-3 rounded-lg shadow-lg flex items-center ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* ... (header giữ nguyên) */}
          <div className="bg-purple-600 text-white p-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Thực đơn cá nhân</h1>
              <div className="flex items-center mt-1">
                <User className="h-4 w-4 mr-2" />
                <span className="text-sm">Giao diện Bệnh nhân</span>
              </div>
            </div>
            {showResults && (
              <button
                onClick={onLogout}
                className="bg-purple-700 hover:bg-purple-800 text-white py-1 px-3 rounded-lg flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Đăng xuất</span>
              </button>
            )}
          </div>

          <div className="p-4">
            {!showResults ? (
              // ... (phần login giữ nguyên)
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-4">
                  Đăng nhập để xem thực đơn
                </h2>
                {error && (
                  <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                  >
                    <p>{error}</p>
                  </div>
                )}
                <form onSubmit={handlePatientLogin} className="max-w-md">
                  <div className="mb-4">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="patientId"
                    >
                      Mã bệnh nhân
                    </label>
                    <input
                      id="patientId"
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập mã bệnh nhân (VD: BN001)"
                    />
                  </div>
                  <div className="mb-6">
                    <label
                      className="block text-sm font-medium text-gray-700 mb-1"
                      htmlFor="patientName"
                    >
                      Họ tên bệnh nhân
                    </label>
                    <input
                      id="patientName"
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Nhập đầy đủ họ tên"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg"
                  >
                    Xem thực đơn
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {/* ... (thông tin bệnh nhân giữ nguyên) */}
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-800">
                    Thông tin bệnh nhân
                  </h2>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Mã bệnh nhân:</p>
                        <p className="font-medium">{patientData.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Họ tên:</p>
                        <p className="font-medium">{patientData.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phòng:</p>
                        <p className="font-medium">{patientData.room}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Giường:</p>
                        <p className="font-medium">{patientData.bed}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">
                          Tình trạng bệnh lý:
                        </p>
                        <p className="font-medium">
                          {patientData.conditions.length > 0
                            ? patientData.conditions.join(", ")
                            : "Không có"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {error && (
                  <div
                    className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                    role="alert"
                  >
                    <p>{error}</p>
                  </div>
                )}
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-sm shadow-sm">
                  {/* ... (hiển thị trạng thái bếp và đánh giá đã gửi) ... */}
                  <h4 className="font-semibold text-yellow-800 mb-1.5 flex items-center">
                    <Info size={16} className="mr-1.5 text-yellow-600" />
                    Trạng thái từ bếp & Đánh giá của bạn:
                  </h4>
                  {["breakfast", "lunch", "dinner"].map((mt) => {
                    const ratingInfo = {
                      1: "Rất tệ",
                      2: "Tệ",
                      3: "Bình thường",
                      4: "Ngon",
                      5: "Rất ngon",
                    };
                    const currentMealRatingData = mealRatings[mt];
                    return (
                      <div
                        key={mt}
                        className="ml-2 mb-1.5 border-b border-yellow-100 pb-1.5 last:border-0 last:pb-0"
                      >
                        <div className={`flex justify-between items-center`}>
                          <div
                            className={`capitalize ${
                              kitchenMealCompletion[mt]
                                ? "text-green-700"
                                : "text-orange-700"
                            }`}
                          >
                            {getMealTypeName(mt)}:
                            {kitchenMealCompletion[mt] ? (
                              <span className="font-semibold text-green-600 ml-1">
                                ĐÃ XONG{" "}
                                <Check size={14} className="inline mb-0.5" />
                              </span>
                            ) : (
                              <span className="ml-1">Đang xử lý / Chờ món</span>
                            )}
                          </div>
                          {currentMealRatingData?.rating && (
                            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full flex items-center">
                              <Star
                                size={12}
                                className="inline fill-current text-purple-500 mr-1"
                              />
                              {ratingInfo[currentMealRatingData.rating] ||
                                `${currentMealRatingData.rating} sao`}
                            </span>
                          )}
                        </div>
                        {selectedMeals[mt] && (
                          <div className="mt-1 text-gray-700 bg-white bg-opacity-60 p-1.5 rounded-md">
                            <span className="font-medium">Món đã chọn: </span>
                            <span>{selectedMeals[mt].name}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({selectedMeals[mt].calories} kcal)
                            </span>
                          </div>
                        )}
                        {currentMealRatingData?.feedback &&
                          kitchenMealCompletion[mt] && (
                            <div className="mt-1 text-xs text-gray-500 bg-yellow-100 p-1.5 rounded-md border border-yellow-200">
                              <span className="font-medium">
                                Góp ý của bạn:
                              </span>{" "}
                              {currentMealRatingData.feedback}
                            </div>
                          )}
                      </div>
                    );
                  })}
                  {/* ... */}
                </div>

                <div className="mb-6">
                  {/* ... (header thực đơn ngày) ... */}
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Thực đơn ngày {currentDate}
                    </h2>
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-5 w-5 mr-1.5" />
                      <span className="text-sm">{currentDate}</span>
                    </div>
                  </div>

                  {recommendedMeals && (
                    <div className="space-y-5">
                      {["breakfast", "lunch", "dinner"].map((mealType) => (
                        <MealSection
                          key={mealType}
                          title={getMealTypeName(mealType)}
                          icon={
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          }
                          timeLabel={
                            mealType === "breakfast"
                              ? "06:30-07:30"
                              : mealType === "lunch"
                              ? "11:30-12:30"
                              : "17:30-18:30"
                          }
                          meals={recommendedMeals[mealType] || []}
                          selectedMeal={selectedMeals[mealType]}
                          onSelectMeal={(meal) =>
                            handleSelectMeal(mealType, meal)
                          }
                          isCompletedByKitchen={kitchenMealCompletion[mealType]}
                          mealType={mealType}
                          onRequestSpecial={() =>
                            handleOpenRequestForm(mealType)
                          }
                          currentRatingData={mealRatings[mealType]} // Truyền cả object rating và feedback
                          onRateMeal={handleRateMeal}
                        />
                      ))}
                    </div>
                  )}
                  {/* ... (phần nút gửi/reset và thông báo cuối giữ nguyên) ... */}
                  <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={handleSubmitOrder}
                      disabled={Object.values(kitchenMealCompletion).every(
                        (s) => s === true
                      )}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white py-2.5 px-6 rounded-lg flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {dailyOrderSentByPatient
                        ? "Cập nhật thực đơn"
                        : "Gửi thực đơn"}
                    </button>

                    {dailyOrderSentByPatient && (
                      <button
                        onClick={handleResetOrder}
                        disabled={
                          Object.values(kitchenMealCompletion).some(
                            (s) => s === true
                          ) &&
                          Object.values(selectedMeals).every(
                            (m) =>
                              m === null ||
                              kitchenMealCompletion[
                                Object.keys(selectedMeals).find(
                                  (k) => selectedMeals[k] === m
                                )
                              ]
                          )
                        }
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-lg flex items-center justify-center text-sm font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Xóa lựa chọn ngày
                      </button>
                    )}
                  </div>
                  {Object.values(kitchenMealCompletion).every(
                    (s) => s === true
                  ) &&
                    !Object.values(mealRatings).every(
                      (r) => r.rating !== null
                    ) && (
                      <p className="text-center text-sm text-gray-500 mt-4 italic">
                        Tất cả các bữa đã được bếp chuẩn bị xong. Vui lòng đánh
                        giá chất lượng bữa ăn.
                      </p>
                    )}
                  {Object.values(kitchenMealCompletion).every(
                    (s) => s === true
                  ) &&
                    Object.values(mealRatings).every(
                      (r) => r.rating !== null
                    ) && (
                      <p className="text-center text-sm text-green-600 mt-4 italic">
                        Cảm ơn bạn đã hoàn tất đánh giá các bữa ăn!
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showRequestForm && (
        // ... (Modal yêu cầu món đặc biệt giữ nguyên)
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Yêu cầu món đặc biệt - {getMealTypeName(requestForm.mealType)}
              </h3>
              <button
                onClick={handleCloseRequestForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {kitchenMealCompletion[requestForm.mealType] ? (
              <p className="text-red-600 p-4 bg-red-50 rounded-md text-center text-sm">
                Bữa {getMealTypeName(requestForm.mealType).toLowerCase()} đã
                được bếp chuẩn bị xong, không thể yêu cầu món đặc biệt.
              </p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Chọn món ăn bạn muốn:
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                    {(recommendedMeals[requestForm.mealType] || []).length >
                    0 ? (
                      (recommendedMeals[requestForm.mealType] || []).map(
                        (meal) => (
                          <div
                            key={meal.id}
                            className={`border rounded-md p-2.5 cursor-pointer hover:bg-purple-50 transition-colors ${
                              requestForm.requestedMealId === meal.id
                                ? "border-purple-500 bg-purple-100 ring-1 ring-purple-500"
                                : "border-gray-200 bg-white"
                            }`}
                            onClick={() => handleSelectRequestedMeal(meal)}
                          >
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">
                                {meal.name}
                              </span>
                              {requestForm.requestedMealId === meal.id && (
                                <Check size={18} className="text-purple-600" />
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {meal.calories} kcal
                            </span>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-xs text-gray-400 p-2 text-center">
                        Không có món gợi ý cho buổi này.
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Lý do yêu cầu (bắt buộc):
                  </label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) =>
                      setRequestForm({ ...requestForm, reason: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm"
                    rows="3"
                    placeholder="VD: Dị ứng, không hợp khẩu vị..."
                  ></textarea>
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <button
                    onClick={handleCloseRequestForm}
                    className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSubmitRequest}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Gửi yêu cầu
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
