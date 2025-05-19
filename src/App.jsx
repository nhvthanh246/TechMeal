import { useState, useEffect } from "react";
import "./styles.css";
import { LoginView } from "./components/LoginView";
import { DoctorView } from "./components/DoctorView";
import { KitchenView } from "./components/KitchenView";
import { PatientView } from "./components/PatientView";

export default function HospitalMealSystem() {
  const [currentView, setCurrentView] = useState("login");
  const [patients, setPatients] = useState([]);
  const [meals, setMeals] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(
    // Định dạng ngày: DD/MM/YYYY cho Việt Nam
    new Date().toLocaleDateString("vi-VN")
  );

  // Initial data
  useEffect(() => {
    setPatients([
      {
        id: "BN001",
        name: "Nguyễn Văn A",
        room: "101",
        bed: "1",
        conditions: ["tiểu đường", "huyết áp cao"],
        customMeal: {},
      },
      {
        id: "BN002",
        name: "Trần Thị B",
        room: "102",
        bed: "2",
        conditions: ["tiểu đường"],
        customMeal: {},
      },
      {
        id: "BN003",
        name: "Lê Văn C",
        room: "103",
        bed: "1",
        conditions: [],
        customMeal: {},
      },
    ]);
    setMeals({
      breakfast: [
        {
          id: "b1",
          name: "Cháo trắng thịt băm",
          calories: 250,
          protein: "15g",
          ingredients: ["Gạo", "Thịt heo", "Hành"],
          suitable: ["tiểu đường"],
        },
        {
          id: "b2",
          name: "Bánh mì trứng",
          calories: 320,
          protein: "18g",
          ingredients: ["Bánh mì", "Trứng", "Rau"],
          suitable: [],
        },
        {
          id: "b3",
          name: "Phở gà",
          calories: 380,
          protein: "22g",
          ingredients: ["Bánh phở", "Thịt gà", "Hành ngò"],
          suitable: [],
        },
      ],
      lunch: [
        {
          id: "l1",
          name: "Cơm gà luộc",
          calories: 450,
          protein: "28g",
          ingredients: ["Gạo", "Thịt gà", "Rau"],
          suitable: ["tiểu đường", "huyết áp cao"],
        },
        {
          id: "l2",
          name: "Cơm cá hấp rau củ",
          calories: 380,
          protein: "22g",
          ingredients: ["Gạo", "Cá", "Rau củ"],
          suitable: ["tiểu đường", "huyết áp cao"],
        },
        {
          id: "l3",
          name: "Bún chả",
          calories: 420,
          protein: "24g",
          ingredients: ["Bún", "Thịt lợn", "Nước mắm"],
          suitable: [],
        },
      ],
      dinner: [
        {
          id: "d1",
          name: "Cơm chiên rau củ",
          calories: 380,
          protein: "15g",
          ingredients: ["Gạo", "Rau củ", "Trứng"],
          suitable: ["tiểu đường", "huyết áp cao"],
        },
        {
          id: "d2",
          name: "Canh chua cá lóc",
          calories: 320,
          protein: "20g",
          ingredients: ["Cá lóc", "Rau canh chua"],
          suitable: ["tiểu đường", "huyết áp cao"],
        },
        {
          id: "d3",
          name: "Súp gà rau củ",
          calories: 280,
          protein: "18g",
          ingredients: ["Thịt gà", "Rau củ", "Nấm"],
          suitable: ["tiểu đường", "huyết áp cao"],
        },
      ],
    });
  }, []);

  const handleLogin = (userType) => {
    setCurrentUser({ type: userType });
    setCurrentView(userType);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("login");
  };

  const handleAddPatient = (patient) => {
    setPatients([...patients, { ...patient, customMeal: {} }]);
  };

  // Cập nhật toàn bộ đối tượng meals (dùng khi import file hoặc KitchenView thêm món mới và truyền lên cả object)
  const handleUpdateMealsObject = (newMealsObject) => {
    setMeals(newMealsObject);
  };

  // Cập nhật danh sách bệnh nhân (dùng khi KitchenView thay đổi thông tin bệnh nhân, vd: customMeal)
  const handleUpdatePatientsList = (updatedPatientsList) => {
    setPatients(updatedPatientsList);
  };

  const renderView = () => {
    switch (currentView) {
      case "login":
        return <LoginView onLogin={handleLogin} />;
      case "doctor":
        return (
          <DoctorView
            patients={patients}
            onAddPatient={handleAddPatient}
            onLogout={handleLogout}
          />
        );
      case "kitchen":
        return (
          <KitchenView
            meals={meals}
            patients={patients}
            onUpdateMeal={handleUpdateMealsObject} // Truyền hàm cập nhật cả object meals
            onUpdatePatients={handleUpdatePatientsList} // Truyền hàm cập nhật danh sách patients
            onLogout={handleLogout}
            currentDate={currentDate} // Truyền ngày hiện tại
          />
        );
      case "patient":
        return (
          <PatientView
            patients={patients}
            meals={meals}
            onLogout={handleLogout}
            currentDate={currentDate}
          />
        );
      default:
        return <LoginView onLogin={handleLogin} />;
    }
  };

  return <div className="min-h-screen bg-blue-50">{renderView()}</div>;
}
