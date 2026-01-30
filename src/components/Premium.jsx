import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";

const Premium = () => {
  const [isUserPremium, setIsUserPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyPremiumUser();
  }, []);

  const verifyPremiumUser = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/payment/premium/verify`, {
        withCredentials: true,
      });
      setIsUserPremium(!!res.data.isPremium);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = async (type) => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded");
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/payment/create`,
        { membershipType: type },
        { withCredentials: true }
      );

      const { orderId, keyId, amount, currency } = res.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "DevTinder",
        description: "Premium Membership",
        order_id: orderId,
        handler: () => {
          alert("Payment successful 🎉");
          verifyPremiumUser();
        },
        theme: { color: "#9333ea" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (isUserPremium) {
    return (
      <div className="text-center mt-20 text-xl text-green-400 font-bold">
        You are already a Premium user ⭐
      </div>
    );
  }

  return (
    <div className="m-6 md:m-10">
      <h1 className="text-4xl font-bold text-center mb-12">
        Premium Membership
      </h1>

      <div className="flex flex-col md:flex-row gap-8 justify-center">
        <div className="bg-base-300 p-8 rounded-xl w-full md:w-[420px]">
          <h2 className="text-2xl font-bold text-purple-400 text-center mb-6">
            Silver Membership
          </h2>

          <ul className="space-y-3">
            <li>✔ Chat with other people</li>
            <li>✔ 100 requests/day</li>
            <li>✔ Blue Tick</li>
            <li>✔ 3 months</li>
          </ul>

          <button
            onClick={() => handleBuyClick("silver")}
            className="mt-8 w-full py-3 rounded-lg font-bold text-white
                       bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Buy Silver
          </button>
        </div>

        <div className="bg-base-300 p-8 rounded-xl w-full md:w-[420px]">
          <h2 className="text-2xl font-bold text-orange-400 text-center mb-6">
            Gold Membership
          </h2>

          <ul className="space-y-3">
            <li>✔ Chat with other people</li>
            <li>✔ Infinite requests</li>
            <li>✔ Blue Tick</li>
            <li>✔ 6 months</li>
          </ul>

          <button
            onClick={() => handleBuyClick("gold")}
            className="mt-8 w-full py-3 rounded-lg font-bold text-white
                       bg-gradient-to-r from-yellow-500 to-orange-500"
          >
            Buy Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default Premium;
