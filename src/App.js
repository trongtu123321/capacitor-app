import React, { useState, useEffect } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Share } from "@capacitor/share";
import { Camera, CameraResultType } from '@capacitor/camera';
import "./App.css";

const App = () => {
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    // Request permission for notifications when component mounts
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const permission = await LocalNotifications.requestPermissions();
      console.log('Permission status:', permission);
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  const handleCalculate = async () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0 || w <= 0) {
      alert("Vui lòng nhập chiều cao và cân nặng hợp lệ!");
      return;
    }
    const calculatedBmi = (w / (h * h)).toFixed(1);
    let bmiStatus = "";
    if (calculatedBmi < 16) bmiStatus = "Gầy độ III";
    else if (calculatedBmi < 17) bmiStatus = "Gầy độ II";
    else if (calculatedBmi < 18.5) bmiStatus = "Gầy độ I";
    else if (calculatedBmi < 25) bmiStatus = "Bình thường";
    else if (calculatedBmi < 30) bmiStatus = "Thừa cân";
    else if (calculatedBmi < 35) bmiStatus = "Béo phì độ I";
    else if (calculatedBmi < 40) bmiStatus = "Béo phì độ II";
    else bmiStatus = "Béo phì độ III";

    setBmi(calculatedBmi);
    setStatus(bmiStatus);

    try {
      // Kiểm tra quyền thông báo
      const permissionStatus = await LocalNotifications.checkPermissions();
      
      if (permissionStatus.display !== 'granted') {
        await requestPermissions();
      }

      // Gửi thông báo cục bộ
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Kết Quả BMI",
            body: `Chỉ số BMI của bạn là: ${calculatedBmi}
Phân loại: ${bmiStatus}
Cân nặng: ${w} kg
Chiều cao: ${height} cm`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now()) },
            sound: true,
            autoCancel: true,
            smallIcon: "ic_launcher",
            largeIcon: "ic_launcher",
            channelId: "bmi-notifications",
            importance: 4
          }
        ]
      });
    } catch (error) {
      console.error('Lỗi hiển thị thông báo:', error);
      alert('Không thể hiển thị thông báo. Vui lòng kiểm tra quyền thông báo của ứng dụng.');
    }
  };

  const handleShare = async () => {
    if (!bmi) {
      alert("Hãy tính BMI trước khi chia sẻ!");
      return;
    }
    try {
      await Share.share({
        title: "Kết quả tính BMI",
        text: `Chỉ số BMI của tôi là: ${bmi}
Phân loại: ${status}
Cân nặng: ${weight} kg
Chiều cao: ${height} cm
Tỷ lệ mỡ: ${(parseFloat(bmi) * 1.2).toFixed(1)}%`,
        dialogTitle: "Chia sẻ kết quả BMI",
      });
    } catch (error) {
      console.error('Lỗi khi chia sẻ:', error);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl
      });
      
      setPhoto(image.dataUrl);
    } catch (error) {
      console.error('Lỗi khi chụp ảnh:', error);
    }
  };

  return (
    <div className="bmi-container">
      <div className="bmi-header">
        <h1>Tính Chỉ Số BMI</h1>
      </div>
      
      <div className="input-section">
        <div className="input-group">
          <div className="input-label">
            <label>TUỔI</label>
            <span className="unit-label">Năm</span>
          </div>
          <div className="input-with-unit">
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input-field"
              placeholder="0"
              min="0"
              max="120"
            />
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">
            <label>CHIỀU CAO</label>
            <span className="unit-label">CM</span>
          </div>
          <div className="input-with-unit">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input-field"
              placeholder="0"
              min="0"
              max="250"
            />
          </div>
        </div>

        <div className="input-group">
          <div className="input-label">
            <label>CÂN NẶNG</label>
            <span className="unit-label">KG</span>
          </div>
          <div className="input-with-unit">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input-field"
              placeholder="0"
              min="0"
              max="500"
            />
          </div>
        </div>
      </div>

      <div className="result-section">
        {bmi && (
          <>
            <div className="bmi-result">
              <div className="bmi-value">{bmi}</div>
              <div className="weight-value">{weight} kg</div>
              <div className="fat-percentage">Tỷ lệ mỡ: {(parseFloat(bmi) * 1.2).toFixed(1)}%</div>
            </div>
            <div className="bmi-scale">
              <div className="indicator" style={{ left: `${Math.min(100, (bmi / 40) * 100)}%` }}></div>
            </div>
          </>
        )}
      </div>

      <div className="classification-section">
        <h3>PHÂN LOẠI CHỈ SỐ BMI</h3>
        <div className="classification-list">
          <div className="classification-item">Gầy độ III: &lt; 16</div>
          <div className="classification-item">Gầy độ II: 16 - 17</div>
          <div className="classification-item">Gầy độ I: 17 - 18.5</div>
          <div className="classification-item">Bình thường: 18.5 - 25</div>
          <div className="classification-item">Thừa cân: 25 - 30</div>
          <div className="classification-item">Béo phì độ I: 30 - 35</div>
          <div className="classification-item">Béo phì độ II: 35 - 40</div>
          <div className="classification-item">Béo phì độ III: &gt; 40</div>
        </div>
      </div>

      <div className="photo-section">
        {photo && (
          <div className="photo-preview">
            <img src={photo} alt="BMI Result" />
          </div>
        )}
      </div>

      <div className="button-group">
        <button onClick={handleCalculate} className="calculate-button">Tính BMI</button>
        <button onClick={handleTakePhoto} className="photo-button">Chụp Ảnh</button>
        <button onClick={handleShare} className="share-button">Chia Sẻ</button>
      </div>
    </div>
  );
};

export default App;
