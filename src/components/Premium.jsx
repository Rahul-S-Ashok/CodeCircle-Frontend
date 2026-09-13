import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Loader2, Sparkles, Zap } from "lucide-react";

import { BASE_URL } from "../utils/constants";

export default function Premium() {
  const [selectedPlan, setSelectedPlan] = useState("gold");
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    verifyPremium();
  }, []);

  const verifyPremium = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/payment/premium/verify`, {
        withCredentials: true,
      });

      setPremium(Boolean(res.data?.data?.isPremium));
    } catch (err) {
      console.error("Premium verification failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);

      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (paying) return;

    setPaying(true);
    setError("");

    try {
      // Load Razorpay checkout
      const loaded = await loadRazorpay();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay. Check your internet connection.",
        );
      }

      // Create Razorpay order
      const res = await axios.post(
        `${BASE_URL}/payment/create`,
        {
          membershipType: selectedPlan,
        },
        {
          withCredentials: true,
        },
      );

      const order = res.data?.data;

      if (!order?.orderId || !order?.keyId) {
        throw new Error("Invalid payment information received from server.");
      }

      const options = {
        key: order.keyId,

        amount: order.amount,

        currency: order.currency || "INR",

        name: "CodeCircle",

        description:
          selectedPlan === "gold" ? "Gold Membership" : "Silver Membership",

        order_id: order.orderId,

        handler: async function (response) {
          try {
            await axios.post(
              `${BASE_URL}/payment/verify`,
              {
                membershipType: selectedPlan,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                withCredentials: true,
              },
            );

            setPremium(true);

            alert("Payment successful! Welcome to CodeCircle Premium.");

            navigate("/discover", {
              replace: true,
            });
          } catch (err) {
            console.error("Payment verification failed:", err);

            setError(
              err.response?.data?.message ||
                "Payment completed but verification failed.",
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },

        theme: {
          color: "#22d3ee",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        console.error("Razorpay payment failed:", response?.error);

        setError(
          response?.error?.description || "Payment failed. Please try again.",
        );

        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment.",
      );

      setPaying(false);
    }
  };

  // LOADING

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
          Checking membership...
        </div>
      </div>
    );
  }

  // ALREADY PREMIUM

  if (premium) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-amber-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50">
            <Crown className="h-9 w-9 text-amber-500" />
          </div>

          <h1 className="mt-6 text-3xl font-black text-slate-900">
            You're already Premium
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
            You already have access to all CodeCircle Premium features.
          </p>

          <button
            onClick={() => navigate("/discover")}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
          >
            Back to Discover
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-full max-w-5xl pb-10">
      {/* BACK BUTTON */}

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* HEADER */}

      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-violet-100">
          <Crown className="h-7 w-7 text-amber-500" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-amber-500">
          CodeCircle Premium
        </p>

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          Unlock more connections.
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Get more daily interests and unlock the full CodeCircle networking
          experience.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* PLANS */}

      <div className="mx-auto mt-10 grid max-w-3xl gap-5 md:grid-cols-2">
        <PlanCard
          type="silver"
          title="Silver"
          price="₹300"
          selected={selectedPlan === "silver"}
          onSelect={() => setSelectedPlan("silver")}
          features={[
            "More daily interests",
            "Priority discovery",
            "Premium badge",
          ]}
        />

        <PlanCard
          type="gold"
          title="Gold"
          price="₹700"
          selected={selectedPlan === "gold"}
          onSelect={() => setSelectedPlan("gold")}
          popular
          features={[
            "Maximum daily interests",
            "Priority discovery",
            "Premium badge",
            "Best value for active networkers",
          ]}
        />
      </div>

      {/* PAYMENT BUTTON */}

      <div className="mx-auto mt-8 max-w-3xl">
        <button
          type="button"
          onClick={handlePayment}
          disabled={paying}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 text-sm font-black text-white shadow-xl shadow-cyan-500/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {paying ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Opening secure checkout...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5" />
              Pay Now — {selectedPlan === "gold" ? "₹700" : "₹300"}
            </>
          )}
        </button>

        <p className="mt-3 text-center text-xs font-medium text-slate-500">
          Razorpay Test Mode • No real payment required
        </p>
      </div>
    </div>
  );
}

function PlanCard({
  type,
  title,
  price,
  selected,
  onSelect,
  features,
  popular,
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative overflow-hidden rounded-[2rem] border p-6 text-left transition duration-200 ${
        selected
          ? "border-cyan-400 bg-cyan-50 shadow-lg shadow-cyan-500/10"
          : "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* POPULAR */}

      {popular && (
        <div className="absolute right-5 top-5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[9px] font-black uppercase tracking-wider text-violet-600">
          Popular
        </div>
      )}

      {/* PLAN HEADER */}

      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            type === "gold" ? "bg-amber-100" : "bg-slate-100"
          }`}
        >
          <Crown
            className={`h-5 w-5 ${
              type === "gold" ? "text-amber-500" : "text-slate-500"
            }`}
          />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-900">{title}</p>

          <p className="text-xs text-slate-500">
            {type === "gold" ? "For serious networking" : "For getting started"}
          </p>
        </div>
      </div>

      {/* PRICE */}

      <div className="mt-6">
        <span className="text-4xl font-black text-slate-900">{price}</span>

        <span className="ml-2 text-sm text-slate-500">one time</span>
      </div>

      {/* FEATURES */}

      <div className="mt-6 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-3 w-3 text-emerald-600" />
            </div>

            <span className="text-sm font-medium text-slate-600">
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* SELECT STATUS */}

      <div
        className={`mt-6 flex items-center gap-2 text-xs font-semibold ${
          selected ? "text-cyan-600" : "text-slate-500"
        }`}
      >
        <Sparkles className="h-3.5 w-3.5" />

        {selected ? "Selected" : "Select this plan"}
      </div>
    </button>
  );
}
