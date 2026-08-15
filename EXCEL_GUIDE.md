# 📊 Single-Sheet Excel Data Update Guide

Yeh document aapko batata hai ki Calendar App ke liye **Single-Sheet Excel** (`Calendar_Template.xlsx`) kaise bharni aur update karni hai.

---

## ⚡ Key Highlights (Single Sheet System)
1. **1 Single Sheet (`Events`)**: Aapko 2 sheets ki zaroorat nahi hai. Kewal ek hi sheet mein saara data aayega!
2. **No Activity ID**: Activity ko direct uske naam (`Activity name`) se pehchana jayega.
3. **Simple Dates**: Aapko separate month/week/day columns nahi bharne hain. Direct **`Start date`** (e.g. `17 August 2026`) aur **`End date`** (e.g. `20 September 2026`) daalein! App khud hi saal, mahina, week aur days calculate kar lega!
4. **Hidden Icon Column**: `icon` column Excel mein automatically hide rehta hai.

---

## 📄 Excel Columns Layout

| Col # | Column Name | Required? | Description & Example |
| :---: | :--- | :---: | :--- |
| **A** | **`event id`** | **Haan** | Unique Event Code. Example: `ev-1`, `ev-2` |
| **B** | **`Calender type`** | **Haan** | Kaunse tab mein dikhana hai? <br>(Dropdown से select karein: **`Finance`** ya **`Learning`**). |
| **C** | **`Activity name`** | **Haan** | Left column activity row ka naam. Example: `Communications`, `Onboarding` |
| **D** | **`icon`** | Hidden | Lucide Icon name. *(Hidden column in Excel)*. Example: `MessageSquare` |
| **E** | **`Event name`** | **Haan** | Calendar grid bar par likha jaane waala naam. Example: `Q1 Comm Plan` |
| **F** | **`Start date`** | **Haan** | Event shuru hone ki date. Example: `17 August 2026` ya `17/08/2026` |
| **G** | **`End date`** | **Haan** | Event khatam hone ki date. Example: `20 September 2026` ya `20/09/2026` |
| **H** | **`Color`** | **Haan** | Main Event Color. <br>(Dropdown से select karein: `Primary Blue`, `Cobalt Blue`, `Dark Blue`, `Light Blue`, `Pacific Blue`, `Purple`, `Pink`). |
| **I** | **`Description`** | Nahi | Event ki poori detail description text. |
| **J** | **`CTA text`** | Nahi | Event popup ke button ka text. Example: `View Plan` |
| **K** | **`CTA link`** | Nahi | Event popup button ka URL link. Example: `https://example.com/plan` |

---

## 🎨 Official Brand Colors List

Aap Column H (`Color`) mein inme se koi bhi naam dropdown se select kar sakte hain:

1. `Primary Blue` (`#00338d`)
2. `Cobalt Blue` (`#1e49e2`)
3. `Dark Blue` (`#0c233c`)
4. `Light Blue` (`#aceaff`)
5. `Pacific Blue` (`#00b8f5`)
6. `Purple` (`#7213ea`)
7. `Pink` (`#fd349c`)

---

## 🔁 5-Step Deployment Process

1. **Excel Sheet Update & Upload**: App mein **"Import Excel"** ➔ **"Upload Excel"** button se apni single-sheet Excel file upload karein.
2. **`events.json` Download**: App automated updated **`events.json`** download kar dega.
3. **Replace `public/events.json`**: Downloaded `events.json` ko `public/events.json` folder mein replace/paste kar dein.
4. **Build Command**: Terminal mein run karein: `npm run build:standalone`
5. **Paste in Dialog App**: Generated **`standalone.html`** ko Dialog app mein paste kar dein!
