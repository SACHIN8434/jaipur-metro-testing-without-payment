import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyPayment } from "../service/qrgenerator"; // adjust path as needed

export default function PaymentStatus() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get("order_id");

  useEffect(() => {
    const handleVerify = async () => {
      if (!orderId) {
        navigate("/payment-failed");
        return;
      }

      console.log("order id is", orderId);

      try {
        const data = await verifyPayment(orderId);
        console.log("verify response:", data);

        if (data.order_status === "PAID") {
          console.log("✅ PAID - navigating to qr");
          navigate("/qr", { replace: true });
        } else {
          console.log("❌ NOT PAID - status was:", data.order_status);
          navigate("/payment-failed", { replace: true });
        }
      } catch (err) {
        console.error("Verification error:", err.message);
        navigate("/payment-failed");
      }
    };

    handleVerify();
  }, [orderId, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h2>Verifying payment, please wait...</h2>
    </div>
  );
}