const sampleNotices = [
  {
    id: 1,
    type: "lost",
    title: "Gold Wedding Band",
    description: "Plain gold band with engraving \"Forever 2020\" on the inside.",
    category: "Jewelry",
    subcategory: "Ring",
    location_text: "Central Park, NY",
    occurred_at: "2023-10-24",
    reward_amount: 50,
    status: "active",
    view_count: 245,
    created_at: "2023-10-24",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDo9WHkHfvFSEz_aQs73a2w7W6Kd4uJHM3_7LpyH6v3CBqmgJnlIDsk3r7Xa9HYDaX2M0GLXLF2_xT5lwM_p8m4ugCeoaB8lbToFP_ngf_tk_Gl8-2VBla6z8HzFSBVazLZrJjtK5amUrTisD0LvrHM_X06Fl5R4iPQB0ZkOOp4h7oQpDGt8VAj5doql1UB-igmPRysxkRNy28NXh6Z4TZp80YcMrscU6ymqLrZcbhNm8QfwhINzMfa4-pF9jF5AqsphH1wwneWhH4"
  },
  {
    id: 2,
    type: "found",
    title: "Leather Wallet",
    description: "Black leather bi-fold wallet found on a bench.",
    category: "Accessories",
    subcategory: "Wallet",
    location_text: "Grand Central, NY",
    occurred_at: "2023-10-24",
    reward_amount: 0,
    status: "active",
    view_count: 120,
    created_at: "2023-10-24",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAevDcXQi8eL5rmiFsoJWoZ9DPYO5QdtY0WZRlS5OWC5LTDQgQHwYCpmRl8f_3aoknlhO0q8y2XNExWlz_b7m7abMDAyL468YrJdiGBPhEXHeDHsvGxJDqYk62tVhI1hbqM3W2HoMq2puIZAjJwz7yh5eEdP16LDJXUB7SwogoLxG5KqZZ6Vn9KX2hg15b58QEa7iLqemAwhl7UAKwSRErV56GdILJkrSY0h5jSz-74S-n82YyNkru-N39gYCbsHiaTLD5EcM1rmku"
  },
  {
    id: 3,
    type: "lost",
    title: "Blue Denim Jacket",
    description: "Vintage Levi's jacket left at the coffee shop.",
    category: "Clothing",
    subcategory: "Jacket",
    location_text: "Brooklyn, NY",
    occurred_at: "2023-10-23",
    reward_amount: 0,
    status: "active",
    view_count: 88,
    created_at: "2023-10-23",
    image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuANMBlAjz4KDAi3TC8xQALrO3TqaAEgxG9KFWvnPUrX3n8w52DaIyvVAyKm62wwZe7CLEmEp5u6dy01m5azk8KxaLr4gvTlfqIeK93mdvtSkT4Ek2vaPeIugsUXbo4OMkjVN4ggDsBXjP9UF7gHegIptNutwi1MU3Rv3vEVV459qPXYktA5xleJvDbD3dKXe0wvEOQAxxMmsVgCbY0D-cYQvKmatHqhBEItiV8LUmnOmbAXhzk4qt_yWpnP9OHqM7DG7f-NAPB0SffO"
  }
];

const sampleResponses = [
  {
    id: 1,
    notice_id: 1,
    user_name: "Mike K.",
    user_initials: "MK",
    message:
      "Hi Sarah, I was walking my dog near there around 3 PM. I didn't see a phone, but I saw a group of students sitting in that area afterwards.",
    created_at: "2023-10-24 16:30"
  },
  {
    id: 2,
    notice_id: 1,
    user_name: "Sarah Jenkins",
    user_initials: "SJ",
    message:
      "Thanks Mike! I already called the lost and found office but they said nothing had been turned in yet.",
    created_at: "2023-10-24 17:15"
  }
];

const sampleUser = {
  id: 1,
  name: "Sarah Jenkins",
  avatar_url:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD92b6jtz6rCSxCWU6ZXmdBrwX3Lo8r59FPKBe2j4IEz9X6M0x965cjajRVIqieXQC0Y-ycjSB7MeV7gl98CJj0XCSMlK7ZwGmYFbXtovwkxe2bzSfhjLpEkAQOvuK5tik1seTi7lDD0Z-QsDSJK1C44L1qvCfcPXVNk4hGSUB2GS_jCFGX4xs2RKQ4r6pg2ZWjgAbKjAI7IYZdB6VWRG3a1UtflhaVe1UbmCImBRdkf2qFRWSh6yyoUkMOepwZXyddKU63-5cvKhxY"
};

module.exports = {
  sampleNotices,
  sampleResponses,
  sampleUser
};
