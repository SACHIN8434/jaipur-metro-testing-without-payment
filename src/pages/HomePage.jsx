import React, { useEffect, useState } from "react";
import { fetchStations, fetchFare, createPaymentOrder, verifyPayment } from "../service/qrgenerator";
import jaimetroLogo from "../asset/jaipurmetro.png";
import UserProfile from "../components/profile/UserProfile"; // ✅ ADD THIS
import { useNavigate } from "react-router-dom";
import GenerateQr from "./GenerateQr";

const Home = () => {
    let cashfreeInstance = null;
    const navigate = useNavigate();
    const [stations, setStations] = useState([]);
    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");
    const [passengers, setPassengers] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [fareData, setFareData] = useState(null);
    const [fareLoading, setFareLoading] = useState(false);
    const [fareError, setFareError] = useState("");

    useEffect(() => {
        const loadStations = async () => {
            try {
                const data = await fetchStations();
                setStations(data);
            } catch (err) {
                setError("Failed to load stations");
            } finally {
                setLoading(false);
            }
        };

        loadStations();
    }, []);

    useEffect(() => {
        const loadFare = async () => {
            if (!source || !destination) {
                setFareData(null);
                return;
            }

            try {
                setFareLoading(true);
                setFareError("");

                const data = await fetchFare({
                    sourceName: getStationName(source),
                    destinationName: getStationName(destination),
                });

                setFareData(data);
            } catch (err) {
                setFareError("Failed to calculate fare");
                setFareData(null);
            } finally {
                setFareLoading(false);
            }
        };

        loadFare();
    }, [source, destination]);

    const getCashfree = async () => {
        if (!cashfreeInstance) {
            // SDK exposes it as global `Cashfree`, not `window.Cashfree`
            cashfreeInstance = await Cashfree({ mode: "sandbox" });
        }
        return cashfreeInstance;
    };

    const getStationName = (id) =>
        stations.find((s) => s.stationId === Number(id))?.stationName;





    const canPay = source && destination && passengers > 0;
    // const handlePayNow = async () => {
    //     try {

    //         console.log("comming in handle pay now");
    //         console.log("faredata is", fareData)
    //         if (!fareData) return;

    //         const totalFare = fareData.fare * passengers;

    //         // 1️⃣ Create order from backend
    //         const orderData = await createPaymentOrder({ totalFare });

    //         console.log("Order Created:", orderData);

    //         const orderId = orderData.order_id;
    //         const paymentSessionId = orderData.session_id;

    //         if (!paymentSessionId) {
    //             throw new Error("Payment session ID missing");
    //         }

    //         // 2️⃣ Initialize Cashfree
    //         // ✅ Correct - use the load() function
    //         // ✅ Get cashfree instance

    //         const ticketData = {
    //             orderId,
    //             fareData,
    //             passengers,
    //             selectedStations: {
    //                 from: getStationName(source),
    //                 to: getStationName(destination),
    //             },
    //         };

    //         sessionStorage.setItem("ticketData", JSON.stringify(ticketData));

    //         const cashfree = await getCashfree();


    //         // 3️⃣ Open Cashfree Checkout
    //         // ✅ This works because your page never navigates away
    //         const res = await cashfree.checkout({
    //             paymentSessionId: paymentSessionId,
    //             redirectTarget: "_self",
    //             //returnUrl: `${window.location.origin}/payment-status?order_id=${orderId}`,
    //         });
    //         // res is available here after user completes/closes payment
    //         console.log("payment res", res);
    //         // { paymentDetails: { paymentMessage: "Payment successful" } }

    //         // Then call your backend to verify
    //         // const verify = await fetch(`/api/payment/verify?orderId=${orderId}`);
    //         // const data = await verify.json();

    //         const verifypaymentres = await verifyPayment(orderId);
    //         console.log("verifyp payment response is ttt", verifypaymentres);


    //         if (verifypaymentres.order_status === "PAID") {
    //             console.log("order id is", orderId);


    //             navigate("/qr");
    //         } else {
    //             navigate("/payment-failed");
    //         }

    //     } catch (error) {
    //         console.error("Payment failed:", error);
    //         alert(error.message || "Unable to initiate payment");
    //     }
    // };


    const handlePayNow = async () => {
        try {
            if (!fareData) return;

            const totalFare = fareData.fare * passengers;
            const orderData = await createPaymentOrder({ totalFare });
            const orderId = orderData.order_id;
            const paymentSessionId = orderData.session_id;

            if (!paymentSessionId) throw new Error("Payment session ID missing");

            const ticketData = {
                orderId,
                fareData,
                passengers,
                selectedStations: {
                    from: getStationName(source),
                    to: getStationName(destination),
                },
            };
            sessionStorage.setItem("ticketData", JSON.stringify(ticketData));

            const cashfree = await getCashfree();

            // ✅ Use "_modal" — opens as overlay, no page navigation
            const res = await cashfree.checkout({
                paymentSessionId: paymentSessionId,
                redirectTarget: "_modal",
            });

            console.log("payment res", res);

            // This code runs AFTER the modal closes
            const verifypaymentres = await verifyPayment(orderId);

            if (verifypaymentres.order_status === "PAID") {
                navigate("/qr");
            } else {
                navigate("/payment-failed");
            }

        } catch (error) {
            console.error("Payment failed:", error);
            alert(error.message || "Unable to initiate payment");
        }
    };
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                Loading stations...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen text-red-600">
                {error}
            </div>
        );
    }


    const handlePassengerChange = (e) => {
        let value = e.target.value;

        // Allow empty while typing
        if (value === "") {
            setPassengers("");
            return;
        }

        value = Number(value);

        if (Number.isNaN(value)) return;

        if (value < 1) {
            setPassengers(1);
        } else if (value > 6) {
            setPassengers(6);
        } else {
            setPassengers(value);
        }
    };
    return (
        <div className="min-h-screen  px-4 bg-[#FFA794]">
            <div className="max-w-6xl mx-auto min-h-screen flex items-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* LEFT: BOOKING SECTION */}
                    <div className="md:col-span-2 flex justify-center">
                        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                            <div className="flex flex-col items-center mb-6">
                                <img
                                    src={jaimetroLogo}
                                    alt="Jai Metro"
                                    className="h-16 mb-3 object-contain"
                                />
                                <h2 className="text-2xl font-semibold">
                                    Book Metro Ticket
                                </h2>
                            </div>

                            {/* Source */}
                            <label>Source Station</label>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="w-full mb-4 border rounded-lg px-3 py-2"
                            >
                                <option value="">Select source</option>
                                {stations.map((s) => (
                                    <option key={s.stationId} value={s.stationId}>
                                        {s.stationName}
                                    </option>
                                ))}
                            </select>

                            {/* Destination */}
                            <label>Destination Station</label>
                            <select
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                disabled={!source}
                                className="w-full mb-4 border rounded-lg px-3 py-2"
                            >
                                <option value="">Select destination</option>
                                {stations
                                    .filter((s) => s.stationId !== Number(source))
                                    .map((s) => (
                                        <option key={s.stationId} value={s.stationId}>
                                            {s.stationName}
                                        </option>
                                    ))}
                            </select>

                            {/* Passengers */}
                            <label>Number of Passenger</label>
                            <input
                                type="number"
                                min="1"
                                max="6"
                                step="1"
                                value={passengers}
                                onChange={handlePassengerChange}
                                onBlur={() => {
                                    // Fix empty value on blur
                                    if (passengers === "") setPassengers(1);
                                }}
                                onKeyDown={(e) => {
                                    // Block invalid keys
                                    if (["e", "E", "+", "-", "."].includes(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                className="w-full mb-4 border rounded-lg px-3 py-2"
                            />

                            {/* Fare */}
                            {fareData && (
                                <div className="mb-4 p-3 bg-green-50 rounded-lg text-center">
                                    <p className="text-sm">Fare</p>
                                    <p className="text-xl font-semibold text-green-700">
                                        ₹ {fareData.fare * passengers}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handlePayNow}
                                disabled={!canPay}
                                className="w-full py-3 bg-green-600 text-white rounded-lg cursor-pointer"
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>

                    {/* RIGHT: USER PROFILE */}
                    <div className="md:col-span-1">
                        <UserProfile />
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Home;