import React, { useState, useEffect } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { Network } from "@capacitor/network";

function Camera_Function() {
  const [imageUrl, setImageUrl] = useState(null); // State để lưu URL của ảnh
  const [networkStatus, setNetworkStatus] = useState("Đang kiểm tra..."); // State để lưu trạng thái mạng

  // Hàm kiểm tra trạng thái mạng
  const checkNetworkStatus = async () => {
    try {
      const status = await Network.getStatus();
      updateNetworkStatus(status);
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái mạng:", error);
    }
  };

  // Hàm cập nhật trạng thái mạng
  const updateNetworkStatus = (status) => {
    if (status.connected) {
      setNetworkStatus("Đang kết nối mạng");
    } else {
      setNetworkStatus("Không có kết nối mạng");
    }
  };

  // Hàm lắng nghe sự thay đổi trạng thái mạng
  const setupNetworkListener = () => {
    Network.addListener("networkStatusChange", (status) => {
      updateNetworkStatus(status);
      //alert(`Trạng thái mạng đã thay đổi: ${status.connected ? 'Đang kết nối' : 'Mất kết nối'}`);
    });
  };

  // Hàm chụp ảnh và lưu vào thư viện
  const takePhoto = async () => {
    try {
      // Mở camera và chụp ảnh
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, // Sử dụng Uri để lấy đường dẫn ảnh
        source: CameraSource.Camera, // Mở camera trực tiếp
      });

      // Hiển thị ảnh ngay lập tức
      setImageUrl(image.webPath);

      // Chuyển đổi ảnh thành base64 để lưu vào bộ nhớ cục bộ
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const base64Data = await convertBlobToBase64(blob);

      // Lưu ảnh vào thư mục công khai (public directory)
      const fileName = `photo_${new Date().getTime()}.jpeg`;
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents, // Thư mục công khai
        recursive: true, // Tạo thư mục nếu chưa tồn tại
      });

      console.log("Ảnh đã được lưu:", savedFile.uri);

      // Lưu thông tin ảnh vào Preferences (tùy chọn)
      await Preferences.set({
        key: "savedImage",
        value: savedFile.uri,
      });

      // Hiển thị thông báo thành công
      alert("Ảnh đã được lưu vào thư viện!");
    } catch (error) {
      console.error("Lỗi khi chụp hoặc lưu ảnh:", error);
      alert("Có lỗi xảy ra khi lưu ảnh.");
    }
  };

  // Hàm truy cập thư viện ảnh và lấy ảnh vừa chụp
  const accessPhotoLibrary = async () => {
    try {
      // Mở thư viện ảnh và chọn ảnh
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri, // Sử dụng Uri để lấy đường dẫn ảnh
        source: CameraSource.Photos, // Mở thư viện ảnh
      });

      // Hiển thị ảnh được chọn
      setImageUrl(image.webPath);
    } catch (error) {
      console.error("Lỗi khi truy cập thư viện ảnh:", error);
      alert("Có lỗi xảy ra khi truy cập thư viện ảnh.");
    }
  };

  // Hàm chuyển đổi Blob sang base64
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(",")[1]); // Loại bỏ phần đầu của data URL
      };
      reader.readAsDataURL(blob);
    });
  };

  // Kiểm tra trạng thái mạng khi component được mount
  useEffect(() => {
    checkNetworkStatus();
    setupNetworkListener();
  }, []);

  return (
    <div>
      <p>
        Trạng thái mạng: <strong>{networkStatus}</strong>
      </p>
      <button
        onClick={takePhoto}
        style={{ padding: "10px 20px", fontSize: "16px", marginRight: "10px" }}
      >
        Chụp Ảnh
      </button>
      <button
        onClick={accessPhotoLibrary}
        style={{ padding: "10px 20px", fontSize: "16px" }}
      >
        Truy cập Thư viện Ảnh
      </button>
      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <img
            src={imageUrl}
            alt="Ảnh đã lưu"
            style={{
              maxWidth: "100%",
              height: "auto",
              border: "1px solid #ccc",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Camera_Function;
