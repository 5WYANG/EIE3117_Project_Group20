USE findit;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE responses;
TRUNCATE TABLE notice_images;
TRUNCATE TABLE notices;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO users (id, name, email, password_hash, avatar_url)
VALUES
  (
    1,
    'Sarah Jenkins',
    'sarah@example.com',
    '$2b$10$bp6fo5oArHV5Ukm0FVr67ecqx52MkyTG1d4J4GAZafCFHYLXLN94e',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuD92b6jtz6rCSxCWU6ZXmdBrwX3Lo8r59FPKBe2j4IEz9X6M0x965cjajRVIqieXQC0Y-ycjSB7MeV7gl98CJj0XCSMlK7ZwGmYFbXtovwkxe2bzSfhjLpEkAQOvuK5tik1seTi7lDD0Z-QsDSJK1C44L1qvCfcPXVNk4hGSUB2GS_jCFGX4xs2RKQ4r6pg2ZWjgAbKjAI7IYZdB6VWRG3a1UtflhaVe1UbmCImBRdkf2qFRWSh6yyoUkMOepwZXyddKU63-5cvKhxY'
  ),
  (
    2,
    'Mike K.',
    'mike@example.com',
    '$2b$10$bp6fo5oArHV5Ukm0FVr67ecqx52MkyTG1d4J4GAZafCFHYLXLN94e',
    NULL
  );

INSERT INTO notices (
  id, user_id, type, title, description, category, subcategory,
  location_text, occurred_at, reward_amount, status, view_count, created_at
)
VALUES
  (
    1, 1, 'lost', 'Gold Wedding Band',
    'Plain gold band with engraving "Forever 2020" on the inside.',
    'Jewelry', 'Ring', 'Central Park, NY', '2023-10-24', 50.00, 'active', 245, '2023-10-24 10:00:00'
  ),
  (
    2, 1, 'found', 'Leather Wallet',
    'Black leather bi-fold wallet found on a bench.',
    'Accessories', 'Wallet', 'Grand Central, NY', '2023-10-24', 0.00, 'active', 120, '2023-10-24 12:00:00'
  ),
  (
    3, 1, 'lost', 'Blue Denim Jacket',
    'Vintage Levi''s jacket left at the coffee shop.',
    'Clothing', 'Jacket', 'Brooklyn, NY', '2023-10-23', 0.00, 'active', 88, '2023-10-23 14:00:00'
  );

INSERT INTO notice_images (notice_id, image_url, sort_order)
VALUES
  (1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDo9WHkHfvFSEz_aQs73a2w7W6Kd4uJHM3_7LpyH6v3CBqmgJnlIDsk3r7Xa9HYDaX2M0GLXLF2_xT5lwM_p8m4ugCeoaB8lbToFP_ngf_tk_Gl8-2VBla6z8HzFSBVazLZrJjtK5amUrTisD0LvrHM_X06Fl5R4iPQB0ZkOOp4h7oQpDGt8VAj5doql1UB-igmPRysxkRNy28NXh6Z4TZp80YcMrscU6ymqLrZcbhNm8QfwhINzMfa4-pF9jF5AqsphH1wwneWhH4', 1),
  (2, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAevDcXQi8eL5rmiFsoJWoZ9DPYO5QdtY0WZRlS5OWC5LTDQgQHwYCpmRl8f_3aoknlhO0q8y2XNExWlz_b7m7abMDAyL468YrJdiGBPhEXHeDHsvGxJDqYk62tVhI1hbqM3W2HoMq2puIZAjJwz7yh5eEdP16LDJXUB7SwogoLxG5KqZZ6Vn9KX2hg15b58QEa7iLqemAwhl7UAKwSRErV56GdILJkrSY0h5jSz-74S-n82YyNkru-N39gYCbsHiaTLD5EcM1rmku', 1),
  (3, 'https://lh3.googleusercontent.com/aida-public/AB6AXuANMBlAjz4KDAi3TC8xQALrO3TqaAEgxG9KFWvnPUrX3n8w52DaIyvVAyKm62wwZe7CLEmEp5u6dy01m5azk8KxaLr4gvTlfqIeK93mdvtSkT4Ek2vaPeIugsUXbo4OMkjVN4ggDsBXjP9UF7gHegIptNutwi1MU3Rv3vEVV459qPXYktA5xleJvDbD3dKXe0wvEOQAxxMmsVgCbY0D-cYQvKmatHqhBEItiV8LUmnOmbAXhzk4qt_yWpnP9OHqM7DG7f-NAPB0SffO', 1);

INSERT INTO responses (id, notice_id, user_id, message, created_at)
VALUES
  (
    1, 1, 2,
    'Hi Sarah, I was walking my dog near there around 3 PM. I did not see a phone, but I saw a group of students sitting in that area afterwards.',
    '2023-10-24 16:30:00'
  ),
  (
    2, 1, 1,
    'Thanks Mike! I already called the lost and found office but they said nothing had been turned in yet.',
    '2023-10-24 17:15:00'
  );
