// DoctorView
import { useState, useRef, useEffect } from "react";
import {
  UserRound,
  LogOut,
  Upload,
  Download,
  Search,
  X,
  Filter,
  CheckSquare,
} from "lucide-react";

// Hàm chuẩn hóa một số ký tự tiếng Việt thường bị lỗi encoding cơ bản
// Lưu ý: Đây là giải pháp đơn giản, không thể bao phủ hết các trường hợp bảng mã cũ.
// Nên khuyến khích người dùng sử dụng file UTF-8.
function normalizeVietnameseChars(str) {
  if (!str) return "";
  // Ví dụ: Chuyển một số ký tự hay gặp từ Windows-1252 (mà thực ra là TCVN3/VNI bị đọc sai) sang Unicode NFC.
  // Đây chỉ là ví dụ rất cơ bản, thực tế cần phức tạp hơn nhiều.
  // Hoặc sử dụng thư viện nếu cần độ chính xác cao cho nhiều bảng mã.
  // Hiện tại, tập trung vào việc đọc đúng UTF-8 và hy vọng trình duyệt xử lý tốt.
  return str; // Giữ nguyên nếu không có giải pháp chuẩn hóa mạnh mẽ ở client.
}

// Doctor View Component
export function DoctorView({ patients, onAddPatient, onLogout }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    id: "",
    name: "",
    room: "",
    bed: "",
    conditions: [],
  });
  const [selectedConditions, setSelectedConditions] = useState({
    "tiểu đường": false,
    "huyết áp cao": false,
    "dị ứng": false, // Thêm "dị ứng" nếu là một bệnh phổ biến
    "suy thận": false,
    // Thêm các bệnh lý phổ biến khác ở đây nếu cần
  });
  const [fileContent, setFileContent] = useState(null); // { rawContent: string, parsedPatients: array, error: string|null }
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(patients);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [conditionFilters, setConditionFilters] = useState({
    "tiểu đường": false,
    "huyết áp cao": false,
    "dị ứng": false,
    "suy thận": false,
  });
  const [customConditionSearch, setCustomConditionSearch] = useState("");
  const customConditionInputRef = useRef(null);
  const fileInputRef = useRef(null); // Ref cho input file

  useEffect(() => {
    setFilteredPatients(
      patients.filter((patient) => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = patient.name.toLowerCase().includes(searchTermLower);
        const idMatch = patient.id.toLowerCase().includes(searchTermLower);
        const roomMatch = patient.room.toLowerCase().includes(searchTermLower);

        const activeConditionFilters = Object.keys(conditionFilters).filter(
          (key) => conditionFilters[key]
        );
        const conditionMatch =
          activeConditionFilters.length === 0 ||
          activeConditionFilters.some((condition) =>
            patient.conditions.includes(condition)
          );

        return (nameMatch || idMatch || roomMatch) && conditionMatch;
      })
    );
  }, [patients, searchTerm, conditionFilters]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient({ ...newPatient, [name]: value });
  };

  const handleConditionChange = (condition) => {
    setSelectedConditions({
      ...selectedConditions,
      [condition]: !selectedConditions[condition],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const conditions = Object.keys(selectedConditions).filter(
      (condition) => selectedConditions[condition]
    );
    onAddPatient({ ...newPatient, conditions });
    setNewPatient({ id: "", name: "", room: "", bed: "", conditions: [] });
    setSelectedConditions(
      Object.keys(selectedConditions).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    );
    setShowAddForm(false);
  };

  const parsePatientData = (csvContent) => {
    const lines = csvContent
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");
    const patientsArray = [];
    // Bỏ qua dòng header (nếu có), thường là dòng đầu tiên
    // Giả sử file CSV có header: ID,Name,Room,Bed,Conditions
    // Hoặc file TXT mỗi dòng là một bệnh nhân, có thể không có header

    let headerSkipped = false;
    if (
      lines.length > 0 &&
      lines[0].toLowerCase().includes("id") &&
      lines[0].toLowerCase().includes("name")
    ) {
      headerSkipped = true;
    }

    const startIndex = headerSkipped ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Xử lý dòng CSV (tách bằng dấu phẩy, nhưng cẩn thận với dấu phẩy trong ngoặc kép)
      const values = [];
      let currentVal = "";
      let inQuotes = false;
      for (let char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentVal.trim());
          currentVal = "";
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim()); // Add the last value

      if (values.length >= 4) {
        const id = values[0];
        const name = values[1].replace(/^"|"$/g, ""); // Loại bỏ dấu ngoặc kép nếu có
        const room = values[2];
        const bed = values[3];
        const conditionsString = values[4]
          ? values[4].replace(/^"|"$/g, "")
          : "";
        const conditions = conditionsString
          ? conditionsString
              .split(";")
              .map((c) => c.trim())
              .filter((c) => c)
          : [];

        if (id && name && room && bed) {
          // Kiểm tra các trường bắt buộc
          patientsArray.push({ id, name, room, bed, conditions });
        }
      } else {
        // Thử logic parsing cho định dạng TXT không chuẩn như trong file DoctorView (1).js
        // BN001 Nguyễn Văn A 101 1 tiểu đường;huyết áp cao
        const bnMatch = line.match(/^(BN\d+)\s+/);
        if (!bnMatch) continue;
        const patientId = bnMatch[1];
        let remaining = line.substring(bnMatch[0].length).trim();

        const nameEndIndex = remaining.search(/\s+\d+\s+\d+/); // Tên kết thúc trước " phòng giường"
        if (nameEndIndex === -1) continue;
        const patientName = remaining.substring(0, nameEndIndex).trim();
        remaining = remaining.substring(nameEndIndex).trim();

        const parts = remaining.split(/\s+/);
        if (parts.length < 2) continue;

        const patientRoom = parts[0];
        const patientBed = parts[1];
        const patientConditions = parts
          .slice(2)
          .join(" ")
          .split(";")
          .map((c) => c.trim())
          .filter((c) => c);

        if (patientId && patientName && patientRoom && patientBed) {
          patientsArray.push({
            id: patientId,
            name: patientName,
            room: patientRoom,
            bed: patientBed,
            conditions: patientConditions,
          });
        }
      }
    }
    return patientsArray;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawContent = event.target.result;
        try {
          // Cố gắng chuẩn hóa nếu cần, nhưng ưu tiên file UTF-8
          const normalizedContent = normalizeVietnameseChars(rawContent);
          const parsedPatients = parsePatientData(normalizedContent);

          if (parsedPatients.length > 0) {
            setFileContent({
              rawContent: normalizedContent,
              parsedPatients: parsedPatients,
              error: null,
            });
          } else {
            setFileContent({
              rawContent: normalizedContent,
              parsedPatients: [],
              error:
                "Không phân tích được dữ liệu bệnh nhân từ file. Vui lòng kiểm tra định dạng file (CSV hoặc TXT theo mẫu) và đảm bảo file được lưu dưới dạng UTF-8.",
            });
          }
        } catch (error) {
          console.error("Lỗi khi xử lý file:", error);
          setFileContent({
            rawContent: rawContent, // Hiển thị nội dung gốc nếu parse lỗi
            parsedPatients: [],
            error: "Có lỗi xảy ra khi xử lý file: " + error.message,
          });
        }
      };

      reader.onerror = (error) => {
        console.error("Lỗi đọc file:", error);
        setFileContent({
          rawContent: "Không thể đọc nội dung file.",
          parsedPatients: [],
          error:
            "Lỗi khi đọc file. File có thể bị hỏng hoặc không được hỗ trợ.",
        });
      };

      // Luôn thử đọc file với UTF-8 vì đây là chuẩn khuyến nghị
      reader.readAsText(file, "UTF-8");

      // Reset input để có thể chọn lại cùng file nếu cần
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportPatients = () => {
    if (fileContent && fileContent.parsedPatients.length > 0) {
      fileContent.parsedPatients.forEach((patient) => {
        // Kiểm tra xem bệnh nhân đã tồn tại chưa (dựa trên ID)
        if (!patients.find((p) => p.id === patient.id)) {
          onAddPatient(patient);
        } else {
          // Có thể thêm logic cập nhật bệnh nhân nếu muốn
          console.warn(`Bệnh nhân với ID ${patient.id} đã tồn tại, bỏ qua.`);
        }
      });
      alert(
        `Đã nhập và xử lý ${fileContent.parsedPatients.length} bệnh nhân. Các bệnh nhân trùng ID sẽ được bỏ qua.`
      );
      setFileContent(null);
    } else if (
      fileContent &&
      fileContent.parsedPatients.length === 0 &&
      !fileContent.error
    ) {
      alert("Không có bệnh nhân nào được tìm thấy trong file để nhập.");
      setFileContent(null);
    } else if (fileContent && fileContent.error) {
      alert(`Không thể nhập: ${fileContent.error}`);
      // Không reset fileContent để người dùng có thể xem lỗi
    }
  };

  const handleExportPatients = () => {
    const BOM = "\uFEFF"; // Byte Order Mark for UTF-8
    let csvContent = BOM;

    // Header
    const headers = ["ID", "Name", "Room", "Bed", "Conditions"];
    csvContent += headers.join(",") + "\n";

    // Data
    patients.forEach((patient) => {
      const row = [
        patient.id,
        `"${patient.name.replace(/"/g, '""')}"`, // Handle quotes in name
        patient.room,
        patient.bed,
        `"${patient.conditions.join("; ").replace(/"/g, '""')}"`, // Handle quotes in conditions
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "danh_sach_benh_nhan.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("Tính năng tải file không được trình duyệt này hỗ trợ trực tiếp.");
    }
  };

  const toggleFilterDropdown = () => setShowFilterDropdown(!showFilterDropdown);

  const handleConditionFilterChange = (condition) => {
    setConditionFilters({
      ...conditionFilters,
      [condition]: !conditionFilters[condition],
    });
  };

  const handleAddCustomCondition = () => {
    if (customConditionSearch.trim() !== "") {
      const newCondition = customConditionSearch.trim();
      if (!conditionFilters.hasOwnProperty(newCondition)) {
        setConditionFilters({ ...conditionFilters, [newCondition]: true });
        // Cũng nên thêm vào selectedConditions để có thể dùng trong form thêm mới
        if (!selectedConditions.hasOwnProperty(newCondition)) {
          setSelectedConditions({
            ...selectedConditions,
            [newCondition]: false,
          });
        }
      } else {
        setConditionFilters({ ...conditionFilters, [newCondition]: true });
      }
      setCustomConditionSearch("");
    }
  };

  const handleRemoveConditionFilter = (condition) => {
    setConditionFilters({ ...conditionFilters, [condition]: false });
  };

  const handleClearAllFilters = () => {
    setConditionFilters(
      Object.keys(conditionFilters).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {})
    );
    setSearchTerm("");
  };

  const activeFilters = Object.keys(conditionFilters).filter(
    (key) => conditionFilters[key]
  );

  return (
    <div className="min-h-screen bg-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Quản lý bệnh nhân</h1>
              <div className="flex items-center mt-1">
                <UserRound className="h-4 w-4 mr-2" />
                <span className="text-sm">Giao diện Bác sĩ</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-blue-700 hover:bg-blue-800 text-white py-1 px-3 rounded-lg flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span>Đăng xuất</span>
            </button>
          </div>

          <div className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg font-medium text-gray-800">
                Danh sách bệnh nhân
              </h2>
              <div className="flex flex-wrap space-x-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg flex items-center text-sm"
                >
                  {showAddForm ? "Hủy thêm mới" : "Thêm bệnh nhân"}
                </button>
                <label className="bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-3 rounded-lg flex items-center cursor-pointer text-sm">
                  <Upload className="h-4 w-4 mr-1.5" />
                  <span>Tải lên DS</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .txt" // Chấp nhận cả CSV và TXT
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Tải lên danh sách bệnh nhân"
                  />
                </label>
                <button
                  onClick={handleExportPatients}
                  disabled={patients.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-3 rounded-lg flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  <span>Xuất DS</span>
                </button>
              </div>
            </div>

            {/* Khu vực hiển thị xem trước file và lỗi */}
            {fileContent && (
              <div className="mb-4 p-4 border rounded-lg bg-yellow-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-800">
                    Xem trước dữ liệu từ file
                  </h3>
                  <button
                    onClick={() => setFileContent(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>

                {fileContent.error && (
                  <p className="text-sm text-red-600 bg-red-100 p-2 rounded mb-2">
                    <strong>Lỗi:</strong> {fileContent.error}
                  </p>
                )}

                {fileContent.parsedPatients.length > 0 && (
                  <div className="text-sm text-gray-700 mb-2">
                    Đã phân tích được {fileContent.parsedPatients.length} bệnh
                    nhân. Vui lòng kiểm tra và nhấn "Nhập danh sách".
                  </div>
                )}
                {fileContent.parsedPatients.length === 0 &&
                  !fileContent.error && (
                    <div className="text-sm text-gray-600 mb-2">
                      Không tìm thấy dữ liệu bệnh nhân hợp lệ trong file hoặc
                      file rỗng.
                    </div>
                  )}

                <div className="mb-2 max-h-48 overflow-y-auto border rounded bg-white p-2 preview-table-container">
                  {fileContent.parsedPatients.length > 0 ? (
                    <table className="w-full text-xs preview-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Tên</th>
                          <th>Phòng</th>
                          <th>Giường</th>
                          <th>Bệnh lý</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileContent.parsedPatients.map((patient, index) => (
                          <tr key={index}>
                            <td>{patient.id}</td>
                            <td>{patient.name}</td>
                            <td>{patient.room}</td>
                            <td>{patient.bed}</td>
                            <td>{patient.conditions.join("; ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <pre className="text-xs whitespace-pre-wrap break-all font-family-times">
                      {fileContent.rawContent ||
                        "Không có nội dung để hiển thị."}
                    </pre>
                  )}
                </div>
                <button
                  onClick={handleImportPatients}
                  disabled={!fileContent.parsedPatients.length > 0}
                  className="bg-green-600 hover:bg-green-700 text-white py-1.5 px-3 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Nhập danh sách
                </button>
              </div>
            )}

            {showAddForm && (
              <form
                onSubmit={handleSubmit}
                className="mb-6 p-4 border rounded-lg bg-gray-50"
              >
                {/* ... Form thêm bệnh nhân giữ nguyên ... */}
                <h3 className="font-medium text-gray-800 mb-4">
                  Thêm bệnh nhân mới
                </h3>
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="patientId"
                      >
                        Mã bệnh nhân <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="patientId"
                        type="text"
                        name="id"
                        required
                        value={newPatient.id}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Ví dụ: BN001"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="patientName"
                      >
                        Họ tên bệnh nhân <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="patientName"
                        type="text"
                        name="name"
                        required
                        value={newPatient.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="patientRoom"
                      >
                        Phòng <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="patientRoom"
                        type="text"
                        name="room"
                        required
                        value={newPatient.room}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-medium text-gray-700 mb-1"
                        htmlFor="patientBed"
                      >
                        Giường <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="patientBed"
                        type="text"
                        name="bed"
                        required
                        value={newPatient.bed}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tình trạng bệnh lý (chọn hoặc thêm mới ở bộ lọc)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(selectedConditions).map((condition) => (
                        <div key={condition} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`add-${condition}`}
                            checked={selectedConditions[condition]}
                            onChange={() => handleConditionChange(condition)}
                            className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`add-${condition}`}
                            className="text-sm text-gray-700"
                          >
                            {condition}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewPatient({
                          id: "",
                          name: "",
                          room: "",
                          bed: "",
                          conditions: [],
                        });
                      }}
                      className="mr-2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm"
                    >
                      Lưu bệnh nhân
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Thanh tìm kiếm và lọc */}
            <div className="mb-4 flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã BN, phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={toggleFilterDropdown}
                  className={`flex items-center px-3 py-2 border ${
                    activeFilters.length > 0
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-gray-100 border-gray-300 text-gray-700"
                  } rounded-md hover:bg-gray-200 text-sm`}
                >
                  <Filter className="h-4 w-4 mr-1.5" />
                  <span>Lọc bệnh lý</span>
                  {activeFilters.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      {activeFilters.length}
                    </span>
                  )}
                </button>

                {showFilterDropdown && (
                  <div className="absolute mt-1 right-0 z-10 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          Lọc theo bệnh lý
                        </h4>
                        {activeFilters.length > 0 && (
                          <button
                            onClick={handleClearAllFilters}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Xóa tất cả lọc
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                        {Object.keys(conditionFilters).map((condition) => (
                          <div key={condition} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`filter-${condition}`}
                              checked={conditionFilters[condition]}
                              onChange={() =>
                                handleConditionFilterChange(condition)
                              }
                              className="mr-2 h-3.5 w-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={`filter-${condition}`}
                              className="text-sm text-gray-700"
                            >
                              {condition}
                            </label>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Thêm/Lọc bệnh lý khác
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={customConditionSearch}
                            onChange={(e) =>
                              setCustomConditionSearch(e.target.value)
                            }
                            placeholder="Nhập tên bệnh lý..."
                            className="flex-grow p-1.5 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            ref={customConditionInputRef}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCustomCondition();
                              }
                            }}
                          />
                          <button
                            onClick={handleAddCustomCondition}
                            className="px-2.5 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 text-sm"
                          >
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {activeFilters.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5 items-center">
                <span className="text-sm text-gray-600">Đang lọc theo:</span>
                {activeFilters.map((condition) => (
                  <div
                    key={condition}
                    className="flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                  >
                    <CheckSquare className="h-3 w-3 mr-1" />
                    <span>{condition}</span>
                    <button
                      onClick={() => handleRemoveConditionFilter(condition)}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bảng danh sách bệnh nhân */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 border-b text-left font-semibold text-gray-600">
                      Mã BN
                    </th>
                    <th className="py-2 px-3 border-b text-left font-semibold text-gray-600">
                      Họ tên
                    </th>
                    <th className="py-2 px-3 border-b text-left font-semibold text-gray-600">
                      Phòng
                    </th>
                    <th className="py-2 px-3 border-b text-left font-semibold text-gray-600">
                      Giường
                    </th>
                    <th className="py-2 px-3 border-b text-left font-semibold text-gray-600">
                      Bệnh lý
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 border-b">{patient.id}</td>
                      <td className="py-2 px-3 border-b">{patient.name}</td>
                      <td className="py-2 px-3 border-b">{patient.room}</td>
                      <td className="py-2 px-3 border-b">{patient.bed}</td>
                      <td className="py-2 px-3 border-b">
                        {patient.conditions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {patient.conditions.map((condition) => (
                              <span
                                key={condition}
                                className="bg-gray-200 text-gray-700 text-xs px-1.5 py-0.5 rounded-full"
                              >
                                {condition}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Không có
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-4 px-3 text-center text-gray-500 italic"
                      >
                        Không tìm thấy bệnh nhân nào phù hợp với tiêu chí.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CSS cho font Times New Roman */}
      <style>{`
        .font-family-times, 
        .preview-table th, 
        .preview-table td,
        .preview-table-container pre /* Áp dụng cho cả nội dung thô nếu hiển thị */
         {
          font-family: "Times New Roman", Times, serif !important;
        }
        .preview-table {
          width: 100%;
          border-collapse: collapse;
        }
        .preview-table th, .preview-table td {
          border: 1px solid #e2e8f0; /* gray-300 */
          padding: 6px 8px;
          text-align: left;
          vertical-align: top;
        }
        .preview-table th {
          background-color: #f8fafc; /* gray-50 */
          font-weight: bold;
        }
        .preview-table-container pre {
            font-size: 12px;
            line-height: 1.4;
            background-color: #fff;
            padding: 8px;
            border: 1px solid #e2e8f0;
            border-radius: 0.25rem;
            color: #333;
        }

        @media print {
          body, table, th, td, input, button, select, textarea {
            font-family: "Times New Roman", Times, serif !important;
            font-size: 12pt; /* Cỡ chữ phổ biến cho in ấn */
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
