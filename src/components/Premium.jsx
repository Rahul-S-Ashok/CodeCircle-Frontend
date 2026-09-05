import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);

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

      setIsUserPremium(res.data.isPremium);
      dispatch(addUser(res.data));
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

        handler: async function (response) {
      try {
          // Update premium status in backend immediately
          await axios.post(
            `${BASE_URL}/payment/verify`,
            {
              membershipType: type,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              withCredentials: true,
            }
          );

          // Fetch updated user
          await verifyPremiumUser();

          alert("🎉 Premium Activated Successfully!");
        } catch (err) {
          console.error(err);
          alert("Something went wrong while activating Premium.");
        }
      },

        theme: {
          color: "#9333ea",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20 text-xl font-semibold">
        Loading...
      </div>
    );
  }

  if (isUserPremium) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#111827]">
        <div className="bg-base-300 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 p-10 w-[560px] text-center animate-fade-in">
          <div className="text-7xl animate-bounce">👑</div>
          <div className="badge badge-warning badge-outline badge-lg mt-3">
            PREMIUM MEMBER
          </div>

          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 bg-clip-text text-transparent mt-4">
            Welcome to Premium
          </h1>

          <p className="mt-4 text-lg">
            Your membership has been activated successfully.
          </p>

          <div className="divider before:bg-purple-500 after:bg-purple-500"></div>

          <div className="text-left space-y-4">

            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-green-400 font-semibold">
                Active ✅
              </span>
            </div>

            <div className="flex justify-between">
              <span>Membership</span>
              <span className="badge badge-warning badge-lg uppercase">
                {user?.membershipType}
            </span>
            </div>

            <div className="flex justify-between">
              <span>Blue Tick</span>
              <span className="text-blue-400 font-semibold">
                  ✔ Enabled
              </span>
            </div>

            <div className="flex justify-between">
              <span>Chat</span>
              <span className="text-success">
                💬 Unlimited
            </span>
            </div>

            <div className="flex justify-between">
              <span>Requests</span>
              <span>
                {user?.membershipType === "gold"
                  ? "Unlimited"
                  : "100/day"}
              </span>
            </div>

          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:scale-105 transition-all duration-300"
          >
            Explore Feed
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="m-6 md:m-10">
      <h1 className="text-4xl font-bold text-center mb-12">
        Premium Membership
      </h1>

      <div className="flex flex-col md:flex-row gap-8 justify-center">

        {/* Silver Card */}

        <div className="bg-base-300 p-8 rounded-xl w-full md:w-[420px] shadow-xl">
          <h2 className="text-2xl font-bold text-purple-400 text-center mb-6">
            Silver Membership
          </h2>

          <ul className="space-y-3">
            <li>✔ Chat with other people</li>
            <li>✔ 100 requests/day</li>
            <li>✔ Blue Tick</li>
            <li>✔ Valid for 3 months</li>
          </ul>

          <button
            onClick={() => handleBuyClick("silver")}
            className="mt-8 w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition"
          >
            Buy Silver
          </button>
        </div>

        {/* Gold Card */}

        <div className="bg-base-300 p-8 rounded-xl w-full md:w-[420px] shadow-xl">
          <h2 className="text-2xl font-bold text-orange-400 text-center mb-6">
            Gold Membership
          </h2>

          <ul className="space-y-3">
            <li>✔ Chat with other people</li>
            <li>✔ Unlimited requests</li>
            <li>✔ Blue Tick</li>
            <li>✔ Valid for 6 months</li>
          </ul>

          <button
            onClick={() => handleBuyClick("gold")}
            className="mt-8 w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:scale-105 transition"
          >
            Buy Gold
          </button>
        </div>

      </div>
    </div>
  );
};

export default Premium;