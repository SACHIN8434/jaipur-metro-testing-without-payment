

// import { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { encryptForGoServer } from "../utils/encryption.go";
// import { useGoPublicKey } from "../hooks/useGoPublicKey";
// import { QRCode } from "react-qr-code";
// import { encryptDataUsingNodePublicKey } from "../utils/encryption";
// import { addJourney, verifyPayment } from "../service/qrgenerator";

// export default function GenerateQr() {
//     const navigate = useNavigate();
//     const { publicKey, loading, error } = useGoPublicKey();

//     const [ticketData, setTicketData] = useState(null);
//     const [qrValue, setQrValue] = useState("");
//     const [countdown, setCountdown] = useState(3);
//     const [downloaded, setDownloaded] = useState(false);
//     const qrRef = useRef(null);

//     function formatIssuedTime(date = new Date()) {
//         const pad = (n) => String(n).padStart(2, "0");
//         return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
//             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
//     }

//     // ✅ Auto-download when qrValue is ready
//     useEffect(() => {
//         if (!qrValue) return;

//         // countdown 3 → 2 → 1 then download
//         const interval = setInterval(() => {
//             setCountdown((prev) => {
//                 if (prev <= 1) {
//                     clearInterval(interval);
//                     triggerDownload();
//                     return 0;
//                 }
//                 return prev - 1;
//             });
//         }, 1000);

//         return () => clearInterval(interval);
//     }, [qrValue]);

//     useEffect(() => {
//         const generateEncryptedPayload = async () => {
//             const storedTicket = sessionStorage.getItem("ticketData");
//             const storedUser = localStorage.getItem("userSession");

//             // ✅ No ticket data = already used or direct URL access → redirect
//             if (!storedTicket) {
//                 navigate("/dashboard");
//                 return;
//             }

//             if (!storedUser || !publicKey) return;

//             // ... rest of your code
//         };

//         generateEncryptedPayload();
//     }, [publicKey]);

//     const triggerDownload = () => {
//         const svg = qrRef.current?.querySelector("svg");
//         if (!svg) return;

//         const svgData = new XMLSerializer().serializeToString(svg);
//         const canvas = document.createElement("canvas");
//         canvas.width = 300;
//         canvas.height = 300;
//         const ctx = canvas.getContext("2d");

//         const img = new Image();
//         const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
//         const url = URL.createObjectURL(svgBlob);

//         img.onload = () => {
//             ctx.fillStyle = "#ffffff";
//             ctx.fillRect(0, 0, 300, 300);
//             ctx.drawImage(img, 0, 0, 300, 300);
//             URL.revokeObjectURL(url);

//             const pngUrl = canvas.toDataURL("image/png");
//             const a = document.createElement("a");
//             a.href = pngUrl;
//             a.download = `metro-ticket-qr.png`;
//             a.click();

//             setDownloaded(true);
//             setTimeout(() => navigate("/dashboard"), 4000);
//             sessionStorage.removeItem("ticketData");


//         };

//         img.src = url;
//     };

//     useEffect(() => {
//         const generateEncryptedPayload = async () => {
//             const storedTicket = sessionStorage.getItem("ticketData");
//             const storedUser = localStorage.getItem("userSession");
//             if (!storedTicket || !storedUser || !publicKey) return;

//             const ticket = JSON.parse(storedTicket);
//             const user = JSON.parse(storedUser);
//             setTicketData(ticket);

//             const { orderId, fareData, passengers, selectedStations } = ticket;
//             const pathInt = fareData.path.map(p => parseInt(p.split(":")[0], 10));

//             const payload = {
//                 sourceStation: selectedStations.from,
//                 destinationStation: selectedStations.to,
//                 transactionID: orderId,
//                 numOfTickets: passengers,
//                 userid: String(user.id),
//                 ticketType: "SINGLE",
//                 fare: fareData.fare,
//                 path: pathInt,
//                 Mode: "UPI",
//                 issuedTime: formatIssuedTime(),
//                 sourceGenerator: "App",
//                 deviceId: user.appId,
//             };


//              const verifyRes = await verifyPayment(orderId);
//             if (verifyRes.order_status !== "PAID") {
//                 console.log("payment not paid");
//                 navigate("/dashboard", { replace: true });
//             }


//             const encryptedPayload = await encryptForGoServer(publicKey, payload);
//             const res1 = await fetch(`https://qr.jaipurmetrosmartcard.in:8443/generate-multiple-qr`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(encryptedPayload),
//             });




//             const data = await res1.json();
//             const raw = data[0];

//             // Parse the QR response
//             const dashIndex = raw.indexOf('-');
//             const ticketId = raw.substring(0, dashIndex);
//             const hash = raw.substring(dashIndex + 1);

//             console.log("ticket data is", data);
//             console.log("ticketId is", ticketId);
//             console.log("hash is", hash);

//             // ✅ Build the next API payload (mirrors your Flutter structure)
//             const savePayload = {
//                 userId: String(user.id),
//                 source: selectedStations.from,
//                 destination: selectedStations.to,
//                 hash: hash,
//                 fare: fareData.fare,          // baseFare equivalent
//                 ticketId: ticketId,
//             };

//             const encryptedData = await encryptDataUsingNodePublicKey(publicKey, savePayload);
//             console.log("savePayload", savePayload);
//             console.log("encrypted data is", encryptedData)
//             //const journeyResult = await addJourney(encryptedData);



//             setQrValue(hash);


//         };

//         generateEncryptedPayload();
//     }, [publicKey]);

//     if (error) return (
//         <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf2f6" }}>
//             <div className="bg-white rounded-2xl p-8 text-center border" style={{ borderColor: "#F4C0D1" }}>
//                 <p className="font-medium" style={{ color: "#4B1528" }}>Failed to load encryption key</p>
//                 <button onClick={() => navigate(-1)} className="mt-4 text-sm underline" style={{ color: "#993556" }}>Go back</button>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4" style={{ background: "#fdf2f6" }}>

//             {(loading || !ticketData) ? (
//                 <div className="bg-white rounded-2xl w-full overflow-hidden border" style={{ maxWidth: 390, borderColor: "#f4c0d1" }}>
//                     <div className="px-6 py-5" style={{ background: "#993556" }}>
//                         <p className="text-xs uppercase tracking-widest" style={{ color: "#F4C0D1" }}>Jaipur Metro Rail</p>
//                     </div>
//                     <div className="flex flex-col items-center justify-center py-16 gap-3">
//                         <div className="w-8 h-8 rounded-full animate-spin border-2" style={{ borderColor: "#F4C0D1", borderTopColor: "#993556" }} />
//                         <p className="text-sm" style={{ color: "#D4537E" }}>
//                             {loading ? "Loading security keys..." : "Preparing your ticket..."}
//                         </p>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="bg-white rounded-2xl w-full overflow-hidden border" style={{ maxWidth: 390, borderColor: "#f4c0d1" }}>

//                     {/* Header */}
//                     <div className="px-6 py-5" style={{ background: "#993556" }}>
//                         <div className="flex items-center gap-2 mb-4">
//                             <div className="w-2 h-2 rounded-full" style={{ background: "#ED93B1" }} />
//                             <div className="w-2 h-2 rounded-full opacity-50" style={{ background: "#F4C0D1" }} />
//                             <p className="text-xs uppercase tracking-widest ml-1" style={{ color: "#F4C0D1" }}>Jaipur Metro Rail</p>
//                         </div>
//                         <div className="flex items-end gap-2">
//                             <div className="flex-1">
//                                 <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#ED93B1" }}>From</p>
//                                 <p className="text-lg font-medium text-white leading-tight">{ticketData.selectedStations.from}</p>
//                             </div>
//                             <div className="flex flex-col items-center pb-1 px-2 gap-1">
//                                 <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ED93B1" }} />
//                                 <div className="w-px h-5" style={{ background: "#72243E" }} />
//                                 <span style={{ color: "#ED93B1", fontSize: 15 }}>→</span>
//                             </div>
//                             <div className="flex-1 text-right">
//                                 <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#ED93B1" }}>To</p>
//                                 <p className="text-lg font-medium text-white leading-tight">{ticketData.selectedStations.to}</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Meta grid */}
//                     <div className="px-6 pt-5">
//                         <div className="grid grid-cols-2 gap-2.5 mb-5">
//                             {[
//                                 { label: "Passengers", value: ticketData.passengers, big: true },
//                                 { label: "Total fare", value: `₹${ticketData.fareData.fare * ticketData.passengers}`, big: true },
//                                 { label: "Ticket type", value: "Single", big: false },
//                                 { label: "Mode", value: "UPI", big: false },
//                             ].map(({ label, value, big }) => (
//                                 <div key={label} className="rounded-xl px-3 py-2.5 border" style={{ background: "#fdf2f6", borderColor: "#F4C0D1" }}>
//                                     <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#993556" }}>{label}</p>
//                                     <p className={`font-medium ${big ? "text-lg" : "text-sm"}`} style={{ color: "#4B1528" }}>{value}</p>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border mb-5" style={{ background: "#EAF3DE", color: "#27500A", borderColor: "#C0DD97" }}>
//                             <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3B6D11" }} />
//                             Payment confirmed
//                         </div>
//                     </div>

//                     {/* Tear line */}
//                     <div className="flex items-center">
//                         <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: "#fdf2f6" }} />
//                         <div className="flex-1 border-t border-dashed" style={{ borderColor: "#F4C0D1" }} />
//                         <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: "#fdf2f6" }} />
//                     </div>

//                     {/* QR section */}
//                     <div className="flex flex-col items-center gap-3 px-6 py-5">

//                         {/* Hidden QR used only for download */}
//                         <div ref={qrRef} className="absolute opacity-0 pointer-events-none">
//                             {qrValue && <QRCode value={qrValue} size={300} fgColor="#4B1528" />}
//                         </div>

//                         {/* Status message */}
//                         {!qrValue ? (
//                             <div className="w-full rounded-2xl py-8 flex flex-col items-center gap-3 border" style={{ borderColor: "#F4C0D1", background: "#fff9fb" }}>
//                                 <div className="w-6 h-6 rounded-full animate-spin border-2" style={{ borderColor: "#F4C0D1", borderTopColor: "#993556" }} />
//                                 <p className="text-sm" style={{ color: "#D4537E" }}>Generating your QR code...</p>
//                             </div>
//                         ) : !downloaded ? (
//                             <div className="w-full rounded-2xl py-8 flex flex-col items-center gap-2 border" style={{ borderColor: "#F4C0D1", background: "#fff9fb" }}>
//                                 <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "#FBEAF0" }}>
//                                     <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
//                                         <path d="M11 3v10M7 9l4 4 4-4" stroke="#993556" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//                                         <path d="M4 17h14" stroke="#993556" strokeWidth="1.8" strokeLinecap="round" />
//                                     </svg>
//                                 </div>
//                                 <p className="text-sm font-medium" style={{ color: "#4B1528" }}>
//                                     Downloading in {countdown}...
//                                 </p>
//                                 <p className="text-xs" style={{ color: "#D4537E" }}>Your QR ticket is being saved</p>
//                                 <button
//                                     onClick={triggerDownload}
//                                     className="mt-1 text-xs underline"
//                                     style={{ color: "#993556" }}
//                                 >
//                                     Download now
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="w-full rounded-2xl py-8 flex flex-col items-center gap-2 border" style={{ borderColor: "#C0DD97", background: "#f6fbf0" }}>
//                                 <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "#EAF3DE" }}>
//                                     <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
//                                         <path d="M4 12l5 5L18 6" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                                     </svg>
//                                 </div>
//                                 <p className="text-sm font-medium" style={{ color: "#27500A" }}>QR ticket downloaded!</p>
//                                 <p className="text-xs" style={{ color: "#3B6D11" }}>Check your downloads folder</p>
//                                 <button
//                                     onClick={triggerDownload}
//                                     className="mt-1 text-xs underline"
//                                     style={{ color: "#3B6D11" }}
//                                 >
//                                     Download again
//                                 </button>
//                             </div>
//                         )}

//                         <p className="text-xs" style={{ color: "#D4537E" }}>Show this QR at the metro gate</p>
//                         <p className="text-xs font-mono text-center break-all" style={{ color: "#ED93B1" }}>{ticketData.orderId}</p>
//                     </div>

//                     {/* Footer */}
//                     <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: "#fbeaf0", background: "#fffafc" }}>
//                         <span className="text-xs" style={{ color: "#D4537E" }}>Valid for single journey</span>
//                         <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: "#72243E", background: "#FBEAF0", borderColor: "#F4C0D1" }}>
//                             Today only
//                         </span>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { encryptForGoServer } from "../utils/encryption.go";
import { useGoPublicKey } from "../hooks/useGoPublicKey";
import { QRCode } from "react-qr-code";
import { encryptDataUsingNodePublicKey } from "../utils/encryption";
import { addJourney, verifyPayment } from "../service/qrgenerator";

export default function GenerateQr() {
    const navigate = useNavigate();
    const { publicKey, loading, error } = useGoPublicKey();

    const [ticketData, setTicketData] = useState(null);
    const [qrValue, setQrValue] = useState("");
    const [countdown, setCountdown] = useState(3);
    const [downloaded, setDownloaded] = useState(false);
    const [shareStatus, setShareStatus] = useState(""); // "", "sharing", "copied", "error"
    const qrRef = useRef(null);

    function formatIssuedTime(date = new Date()) {
        const pad = (n) => String(n).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
            `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    // Auto-download when qrValue is ready
    useEffect(() => {
        if (!qrValue) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    triggerDownload();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [qrValue]);

    useEffect(() => {
        const generateEncryptedPayload = async () => {
            const storedTicket = sessionStorage.getItem("ticketData");
            const storedUser = localStorage.getItem("userSession");

            if (!storedTicket) {
                navigate("/dashboard");
                return;
            }

            if (!storedUser || !publicKey) return;
        };

        generateEncryptedPayload();
    }, [publicKey]);

    // Helper: render QR to canvas blob
    const getQrBlob = () => {
        return new Promise((resolve, reject) => {
            const svg = qrRef.current?.querySelector("svg");
            if (!svg) return reject(new Error("QR SVG not found"));

            const svgData = new XMLSerializer().serializeToString(svg);
            const canvas = document.createElement("canvas");
            canvas.width = 300;
            canvas.height = 300;
            const ctx = canvas.getContext("2d");

            const img = new Image();
            const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(svgBlob);

            img.onload = () => {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, 300, 300);
                ctx.drawImage(img, 0, 0, 300, 300);
                URL.revokeObjectURL(url);
                canvas.toBlob((blob) => resolve({ blob, canvas }), "image/png");
            };

            img.onerror = () => reject(new Error("Image load failed"));
            img.src = url;
        });
    };

    const triggerDownload = async () => {
        try {
            const { canvas } = await getQrBlob();
            const pngUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = `metro-ticket-qr.png`;
            a.click();

            setDownloaded(true);
            setTimeout(() => navigate("/dashboard"), 4000);
            sessionStorage.removeItem("ticketData");
        } catch (err) {
            console.error("Download failed:", err);
        }
    };

    const shareTicket = async () => {
        setShareStatus("sharing");
        try {
            const { blob } = await getQrBlob();
            const file = new File([blob], "metro-ticket-qr.png", { type: "image/png" });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "Jaipur Metro Ticket",
                    text: `Metro ticket from ${ticketData.selectedStations.from} to ${ticketData.selectedStations.to}`,
                    files: [file],
                });
                setShareStatus("");
            } else if (navigator.share) {
                // Share without file (text + title only)
                await navigator.share({
                    title: "Jaipur Metro Ticket",
                    text: `Metro ticket from ${ticketData.selectedStations.from} to ${ticketData.selectedStations.to}. Order: ${ticketData.orderId}`,
                });
                setShareStatus("");
            } else {
                // Fallback: copy QR value to clipboard
                await navigator.clipboard.writeText(qrValue);
                setShareStatus("copied");
                setTimeout(() => setShareStatus(""), 2500);
            }
        } catch (err) {
            if (err.name === "AbortError") {
                // User cancelled the share sheet — not an error
                setShareStatus("");
            } else {
                console.error("Share failed:", err);
                setShareStatus("error");
                setTimeout(() => setShareStatus(""), 2500);
            }
        }
    };

    useEffect(() => {
        const generateEncryptedPayload = async () => {
            const storedTicket = sessionStorage.getItem("ticketData");
            const storedUser = localStorage.getItem("userSession");
            if (!storedTicket || !storedUser || !publicKey) return;

            const ticket = JSON.parse(storedTicket);
            const user = JSON.parse(storedUser);
            setTicketData(ticket);

            const { orderId, fareData, passengers, selectedStations } = ticket;
            const pathInt = fareData.path.map(p => parseInt(p.split(":")[0], 10));

            const payload = {
                sourceStation: selectedStations.from,
                destinationStation: selectedStations.to,
                transactionID: orderId,
                numOfTickets: passengers,
                userid: String(user.id),
                ticketType: "SINGLE",
                fare: fareData.fare,
                path: pathInt,
                Mode: "UPI",
                issuedTime: formatIssuedTime(),
                sourceGenerator: "App",
                deviceId: user.appId,
            };

            const verifyRes = await verifyPayment(orderId);
            if (verifyRes.order_status !== "PAID") {
                console.log("payment not paid");
                navigate("/dashboard", { replace: true });
            }

            const encryptedPayload = await encryptForGoServer(publicKey, payload);
            const res1 = await fetch(`https://qr.jaipurmetrosmartcard.in:8443/generate-multiple-qr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(encryptedPayload),
            });

            const data = await res1.json();
            const raw = data[0];

            const dashIndex = raw.indexOf('-');
            const ticketId = raw.substring(0, dashIndex);
            const hash = raw.substring(dashIndex + 1);

            console.log("ticket data is", data);
            console.log("ticketId is", ticketId);
            console.log("hash is", hash);

            const savePayload = {
                userId: String(user.id),
                source: selectedStations.from,
                destination: selectedStations.to,
                hash: hash,
                fare: fareData.fare,
                ticketId: ticketId,
            };

            const encryptedData = await encryptDataUsingNodePublicKey(publicKey, savePayload);
            console.log("savePayload", savePayload);
            console.log("encrypted data is", encryptedData);
            // const journeyResult = await addJourney(encryptedData);

            setQrValue(hash);
        };

        generateEncryptedPayload();
    }, [publicKey]);

    // Share button label helper
    const getShareLabel = () => {
        if (shareStatus === "sharing") return "Sharing...";
        if (shareStatus === "copied") return "Copied!";
        if (shareStatus === "error") return "Failed";
        return "Share";
    };

    const getShareColors = () => {
        if (shareStatus === "copied") return { color: "#27500A", borderColor: "#C0DD97", background: "#EAF3DE" };
        if (shareStatus === "error") return { color: "#993556", borderColor: "#F4C0D1", background: "#FBEAF0" };
        return { color: "#72243E", borderColor: "#F4C0D1", background: "#FBEAF0" };
    };

    if (error) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf2f6" }}>
            <div className="bg-white rounded-2xl p-8 text-center border" style={{ borderColor: "#F4C0D1" }}>
                <p className="font-medium" style={{ color: "#4B1528" }}>Failed to load encryption key</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-sm underline" style={{ color: "#993556" }}>Go back</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-10 px-4" style={{ background: "#fdf2f6" }}>

            {(loading || !ticketData) ? (
                <div className="bg-white rounded-2xl w-full overflow-hidden border" style={{ maxWidth: 390, borderColor: "#f4c0d1" }}>
                    <div className="px-6 py-5" style={{ background: "#993556" }}>
                        <p className="text-xs uppercase tracking-widest" style={{ color: "#F4C0D1" }}>Jaipur Metro Rail</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-8 h-8 rounded-full animate-spin border-2" style={{ borderColor: "#F4C0D1", borderTopColor: "#993556" }} />
                        <p className="text-sm" style={{ color: "#D4537E" }}>
                            {loading ? "Loading security keys..." : "Preparing your ticket..."}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl w-full overflow-hidden border" style={{ maxWidth: 390, borderColor: "#f4c0d1" }}>

                    {/* Header */}
                    <div className="px-6 py-5" style={{ background: "#993556" }}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 rounded-full" style={{ background: "#ED93B1" }} />
                            <div className="w-2 h-2 rounded-full opacity-50" style={{ background: "#F4C0D1" }} />
                            <p className="text-xs uppercase tracking-widest ml-1" style={{ color: "#F4C0D1" }}>Jaipur Metro Rail</p>
                        </div>
                        <div className="flex items-end gap-2">
                            <div className="flex-1">
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#ED93B1" }}>From</p>
                                <p className="text-lg font-medium text-white leading-tight">{ticketData.selectedStations.from}</p>
                            </div>
                            <div className="flex flex-col items-center pb-1 px-2 gap-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#ED93B1" }} />
                                <div className="w-px h-5" style={{ background: "#72243E" }} />
                                <span style={{ color: "#ED93B1", fontSize: 15 }}>→</span>
                            </div>
                            <div className="flex-1 text-right">
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#ED93B1" }}>To</p>
                                <p className="text-lg font-medium text-white leading-tight">{ticketData.selectedStations.to}</p>
                            </div>
                        </div>
                    </div>

                    {/* Meta grid */}
                    <div className="px-6 pt-5">
                        <div className="grid grid-cols-2 gap-2.5 mb-5">
                            {[
                                { label: "Passengers", value: ticketData.passengers, big: true },
                                { label: "Total fare", value: `₹${ticketData.fareData.fare * ticketData.passengers}`, big: true },
                                { label: "Ticket type", value: "Single", big: false },
                                { label: "Mode", value: "UPI", big: false },
                            ].map(({ label, value, big }) => (
                                <div key={label} className="rounded-xl px-3 py-2.5 border" style={{ background: "#fdf2f6", borderColor: "#F4C0D1" }}>
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#993556" }}>{label}</p>
                                    <p className={`font-medium ${big ? "text-lg" : "text-sm"}`} style={{ color: "#4B1528" }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border mb-5" style={{ background: "#EAF3DE", color: "#27500A", borderColor: "#C0DD97" }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#3B6D11" }} />
                            Payment confirmed
                        </div>
                    </div>

                    {/* Tear line */}
                    <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: "#fdf2f6" }} />
                        <div className="flex-1 border-t border-dashed" style={{ borderColor: "#F4C0D1" }} />
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: "#fdf2f6" }} />
                    </div>

                    {/* QR section */}
                    <div className="flex flex-col items-center gap-3 px-6 py-5">

                        {/* Hidden QR used only for download/share */}
                        <div ref={qrRef} className="absolute opacity-0 pointer-events-none">
                            {qrValue && <QRCode value={qrValue} size={300} fgColor="#4B1528" />}
                        </div>

                        {/* Status message */}
                        {!qrValue ? (
                            <div className="w-full rounded-2xl py-8 flex flex-col items-center gap-3 border" style={{ borderColor: "#F4C0D1", background: "#fff9fb" }}>
                                <div className="w-6 h-6 rounded-full animate-spin border-2" style={{ borderColor: "#F4C0D1", borderTopColor: "#993556" }} />
                                <p className="text-sm" style={{ color: "#D4537E" }}>Generating your QR code...</p>
                            </div>
                        ) : !downloaded ? (
                            <div className="w-full rounded-2xl py-8 flex flex-col items-center gap-2 border" style={{ borderColor: "#F4C0D1", background: "#fff9fb" }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "#FBEAF0" }}>
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="M11 3v10M7 9l4 4 4-4" stroke="#993556" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 17h14" stroke="#993556" strokeWidth="1.8" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium" style={{ color: "#4B1528" }}>
                                    Downloading in {countdown}...
                                </p>
                                <p className="text-xs" style={{ color: "#D4537E" }}>Your QR ticket is being saved</p>
                                <div className="flex items-center gap-3 mt-1">
                                    <button
                                        onClick={triggerDownload}
                                        className="text-xs underline"
                                        style={{ color: "#993556" }}
                                    >
                                        Download now
                                    </button>
                                    <span style={{ color: "#F4C0D1", fontSize: 12 }}>·</span>
                                    <button
                                        onClick={shareTicket}
                                        disabled={shareStatus === "sharing"}
                                        className="text-xs underline flex items-center gap-1"
                                        style={{ color: "#993556", opacity: shareStatus === "sharing" ? 0.6 : 1 }}
                                    >
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                                                stroke="#993556" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        {getShareLabel()}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full rounded-2xl py-8 flex flex-col items-center gap-2 border" style={{ borderColor: "#C0DD97", background: "#f6fbf0" }}>
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: "#EAF3DE" }}>
                                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                        <path d="M4 12l5 5L18 6" stroke="#3B6D11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium" style={{ color: "#27500A" }}>QR ticket downloaded!</p>
                                <p className="text-xs" style={{ color: "#3B6D11" }}>Check your downloads folder</p>

                                {/* Action buttons */}
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={triggerDownload}
                                        className="text-xs px-3 py-1.5 rounded-full border"
                                        style={{ color: "#3B6D11", borderColor: "#C0DD97", background: "#EAF3DE" }}
                                    >
                                        Download again
                                    </button>
                                    <button
                                        onClick={shareTicket}
                                        disabled={shareStatus === "sharing"}
                                        className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all"
                                        style={{
                                            ...getShareColors(),
                                            opacity: shareStatus === "sharing" ? 0.6 : 1,
                                        }}
                                    >
                                        {shareStatus === "copied" ? (
                                            // Checkmark icon when copied
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 12l5 5L20 6" stroke="#27500A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : (
                                            // Share icon
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
                                                    stroke={shareStatus === "copied" ? "#27500A" : "#993556"}
                                                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                        {getShareLabel()}
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="text-xs" style={{ color: "#D4537E" }}>Show this QR at the metro gate</p>
                        <p className="text-xs font-mono text-center break-all" style={{ color: "#ED93B1" }}>{ticketData.orderId}</p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 flex items-center justify-between border-t" style={{ borderColor: "#fbeaf0", background: "#fffafc" }}>
                        <span className="text-xs" style={{ color: "#D4537E" }}>Valid for single journey</span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full border" style={{ color: "#72243E", background: "#FBEAF0", borderColor: "#F4C0D1" }}>
                            Today only
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}