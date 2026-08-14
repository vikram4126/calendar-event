# 📊 Excel Data Update Guide (Simple & Easy)

Yeh document aapko batata hai ki Calendar App ke liye Excel sheet (`Calendar_Template.xlsx`) kaise fill aur update karni hai.

---

## ⚡ 3-Step Quick Start Process

1. **Template Download Karein**: App khol kar **"Import Excel"** par click karein aur **"Download Template"** dabayein.
2. **Excel Fill / Update Karein**: Excel sheet mein 2 tabs hote hain: **`Activities`** aur **`Events`**. (Neeche bataye tarike se data bharein).
3. **Upload Karein**: Updated Excel file ko app mein **"Upload Excel"** button se select karke upload kar dein.

---

## 📄 Tab 1: `Activities` Sheet

Yeh tab tay karta hai ki calendar mein left side par kaun-kaun se rows (categories) dikhenge.

| Column | Naam | Required? | Aasan Bhasha Mein Matlab | Example |
| :---: | :--- | :---: | :--- | :--- |
| **A** | **`id`** | **Haan** | Unique ID code. (Events ko isse jodte hain). | `a1`, `a2`, `l1` |
| **B** | **`calendarType`** | **Haan** | Kaunse tab mein dikhana hai? <br>Kewal **`Finance`** ya **`Learning`** likhein. | `Finance` |
| **C** | **`name`** | **Haan** | Left column mein dikhne waala Activity ka Naam. | `Communications`, `Onboarding` |

### Sample `Activities` Data:
| id | calendarType | name |
| :--- | :--- | :--- |
| `a1` | Finance | Communications |
| `a2` | Finance | Strategic Planning |
| `l1` | Learning | Employee Onboarding |

---

## 📄 Tab 2: `Events` Sheet

Yeh tab calendar grid par dikhne waale rang-birange event bars ko tay karta hai.

### Column-by-Column Explanation:

#### 1. Basic Info (Event ki Pehchan)
- **Column A (`id`)** *(Required)*: Unique Event ID. Example: `ev-1`, `ev-2`
- **Column B (`activityId`)** *(Required)*: Ye Event kis Activity ka hai? (`Activities` tab ke **`id`** se same match hona chahiye). Example: `a1`
- **Column C (`label`)** *(Required)*: Event bar par likha jaane waala naam. Example: `Q1 Comm Plan`

#### 2. Dates & Months (Kab se Kab tak?)
- **Column D (`startMonth`)** *(Required)*: Event shuru hone ka mahina. <br>Values: `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec` (ya `1` se `12`).
- **Column E (`endMonth`)**: Event khatam hone ka mahina. (Agar 1 hi mahine ka event hai toh blank chhod sakte hain).
- **Column F (`startDay`)** *(Weekly View)*: Hafta (Week) view ke liye starting day: `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`.
- **Column G (`endDay`)** *(Weekly View)*: Hafta view ke liye ending day.
- **Column H (`startWeek`)** *(Weekly View)*: Mahine ka kaunsa hafta? (`1`, `2`, `3`, `4`, `5`).
- **Column I (`endWeek`)** *(Weekly View)*: Mahine ke kis hafte tak? (`1`, `2`, `3`, `4`, `5`).
- **Column J (`year`)** *(Required)*: Event ka saal (Dropdown se select karein: `2024`, `2025`, `2026`, etc.).

#### 3. Styling (Color & Line Design)
- **Column K (`color`)**: Bar ka background color cell (Excel cell mein color preview/fill ke saath dikhta hai). <br>Allowed Colors: `Primary Blue`, `Cobalt Blue`, `Dark Blue`, `Pacific Blue`, `Purple`, `Pink`, `Teal Green`, `Dark Green` (ya hex code jaise `#00338d`).
- **Column L (`borderColor`)**: Left border color cell.
- **Column M (`lineStyle`)**: Border design. Values: `solid`, `dashed`, `dotted`, `gradient`.
- **Column N (`isDashed`)**: Left border dashed rakhne ke liye: `true` ya `false`.
- **Column O (`isTextOnly`)**: Kewal text dikhana ho (transparent bar): `true` ya `false`.

#### 4. Popup Card Info (Click karne par kya dikhega?)
- **Column P (`ctaText`)**: CTA Button text. Example: `View Plan`, `Open Link`
- **Column Q (`ctaLink`)**: CTA URL / Link. Example: `https://example.com/doc`
- **Column R (`category`)**: Category name. Example: `Planning`
- **Column S (`owner`)**: Event ka in-charge / Owner name. Example: `John Doe`
- **Column T (`description`)**: Event ke baare mein poori jankari. Example: `Q1 Strategy Review Meeting`.

---

## 🎨 Supported Colors Quick List

Aap Column K & L mein inme se koi bhi naam likh sakte hain:

1. `Primary Blue` (Deep KPMG Navy)
2. `Cobalt Blue` (Bright Royal Blue)
3. `Dark Blue` (Night Navy)
4. `Pacific Blue` (Light Cyan Blue)
5. `Purple` (Royal Purple)
6. `Pink` (Vibrant Pink)
7. `Teal Green` (Modern Mint Green)
8. `Dark Green` (Forest Green)

---

## 💡 Important Rules & Tips

> [!IMPORTANT]
> **Rule 1 (`activityId` Link)**: `Events` tab mein `activityId` column ki value hamesha `Activities` tab ke `id` se **match** honi chahiye. Agar match nahi hoga toh event calendar par nahi dikhega.

> [!TIP]
> **Rule 2 (Dropdowns)**: Downloaded Template Excel mein har cell par dropdown pehle se bane hain. Dropdown se select karne par koi spelling mistake nahi hogi.
