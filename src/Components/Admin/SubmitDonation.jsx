import React, { useState } from "react";
import moment from "moment";

const SubmitDonation = () => {
  const [formData, setFormData] = useState({
    donorId: "",
    donorName: "",
    address: "",
    phone: "",
    incomeCategory: "",
    amount: "",
    quantity: "",
    unit: "",
    paymentOption: "নগদ টাকা গ্রহণ",
    reference: "",
  });

  // Fake dropdown data (replace with DB values later)
  const addressList = ["কুষ্টিয়া", "ঝিনাইদহ"];
  const incomeCategories = ["যাকাত", "সদকা"];
  const unitOptions = ["কেজি", "পিস"];
  const references = ["মোঃ কামরুল", "মোঃ রহিম"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Allow only numbers for certain fields
    if (
      ["phone", "amount", "quantity"].includes(name) &&
      value !== "" &&
      !/^\d+$/.test(value)
    ) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      donorId: "",
      donorName: "",
      address: "",
      phone: "",
      incomeCategory: "",
      amount: "",
      quantity: "",
      unit: "",
      paymentOption: "নগদ টাকা গ্রহণ",
      reference: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const donationData = {
      ...formData,
      date: moment().format("DD.MM.YYYY"),
      month: moment().format("MM"),
      year: moment().format("YYYY"),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/submitDonation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // if using cookie-based JWT
        body: JSON.stringify(donationData),
      });

      const result = await res.json();

      if (res.ok) {
        alert("ডোনেশন সফলভাবে যুক্ত হয়েছে!");
        handleReset();
      } else {
        alert(result.message || "কিছু ভুল হয়েছে");
      }
    } catch (error) {
      console.error(error);
      alert("সার্ভার সংযোগে সমস্যা হয়েছে");
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-center">দাতার বিবরণ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Donor ID (optional) */}
        <input
          type="text"
          name="donorId"
          placeholder="আইডি (ঐচ্ছিক)"
          value={formData.donorId}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        {/* Donor Name */}
        <input
          type="text"
          name="donorName"
          placeholder="দাতার নাম"
          required
          value={formData.donorName}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        {/* Address */}
        <select
          name="address"
          required
          value={formData.address}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">দাতার ঠিকানা নির্বাচন করুন</option>
          {addressList.map((address, i) => (
            <option key={i} value={address}>
              {address}
            </option>
          ))}
        </select>

        {/* Mobile number (optional) */}
        <input
          type="text"
          name="phone"
          placeholder="দাতার মোবাইল নাম্বার (ঐচ্ছিক)"
          value={formData.phone}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        {/* Income Category */}
        <select
          name="incomeCategory"
          required
          value={formData.incomeCategory}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">আয়ের ক্যাটাগরি নির্বাচন করুন</option>
          {incomeCategories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Amount */}
        <input
          type="text"
          name="amount"
          placeholder="টাকার পরিমান"
          required
          value={formData.amount}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        {/* Quantity */}
        <input
          type="text"
          name="quantity"
          placeholder="পরিমাণ"
          required
          value={formData.quantity}
          onChange={handleChange}
          className="input input-bordered w-full"
        />

        {/* Unit */}
        <select
          name="unit"
          required
          value={formData.unit}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">ইউনিট নির্বাচন করুন</option>
          {unitOptions.map((unit, i) => (
            <option key={i} value={unit}>
              {unit}
            </option>
          ))}
        </select>

        {/* Payment Option */}
        <select
          name="paymentOption"
          required
          value={formData.paymentOption}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          {["নগদ টাকা গ্রহণ", "বিকাশ একাউন্ট", "নগদ একাউন্ট", "ব্যাংক একাউন্ট"].map(
            (option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            )
          )}
        </select>

        {/* Reference (Collector) */}
        <select
          name="reference"
          required
          value={formData.reference}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="">রেফারেন্স (আদায়কারী) নির্বাচন করুন</option>
          {references.map((name, i) => (
            <option key={i} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Buttons */}
        <div className="flex justify-between">
          <button type="submit" className="btn btn-primary">
            সাবমিট করুন
          </button>
          <button type="button" className="btn btn-warning" onClick={handleReset}>
            রিসেট
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitDonation;
