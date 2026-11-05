/* myFunctions.js - ملف جافاسكريبت الموحد لموقع تأجير السيارات */

/* --- إدارة اختيار السيارات --- */

// تحديث قائمة السيارات المختارة وإظهار زر المتابعة
function updateSelectedSummary() {
    // إعادة تعيين تمييز جميع الصفوف أولاً
    var allRows = document.querySelectorAll('.car-row');
    var ri;
    for (ri = 0; ri < allRows.length; ri++) {
        allRows[ri].classList.remove('row-selected');
    }

    var checkboxes = document.querySelectorAll('.car-select-cb:checked');
    var summaryDiv  = document.getElementById('selected-summary');
    var list        = document.getElementById('selected-cars-list');
    var continueBtn = document.getElementById('btn-continue');

    // مسح القائمة القديمة
    list.innerHTML = '';

    if (checkboxes.length === 0) {
        summaryDiv.classList.remove('show');
        continueBtn.style.display = 'none';
        hideBookingForm();
        return;
    }

    summaryDiv.classList.add('show');
    continueBtn.style.display = 'inline-flex';

    var i;
    for (i = 0; i < checkboxes.length; i++) {
        var li = document.createElement('li');
        li.textContent = checkboxes[i].getAttribute('data-model');
        list.appendChild(li);
        // تمييز الصف المختار بلون أخضر خفيف
        var parentRow = checkboxes[i].parentNode.parentNode;
        if (parentRow) {
            parentRow.classList.add('row-selected');
        }
    }
}

// إخفاء نموذج الحجز
function hideBookingForm() {
    var section = document.getElementById('booking-form-section');
    if (section) {
        section.classList.remove('show');
    }
}

// إظهار نموذج الحجز عند الضغط على متابعة
function showBookingForm() {
    var checkboxes = document.querySelectorAll('.car-select-cb:checked');
    if (checkboxes.length === 0) {
        alert('الرجاء اختيار سيارة واحدة على الأقل!');
        return;
    }
    var section = document.getElementById('booking-form-section');
    section.classList.add('show');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --- دوال التحقق من الحقول --- */

// إظهار رسالة خطأ لحقل معين
function showError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    var errEl = document.getElementById(fieldId + '-err');
    if (field) {
        field.classList.add('field-error');
    }
    if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('show');
    }
}

// إخفاء رسالة الخطأ
function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errEl = document.getElementById(fieldId + '-err');
    if (field) {
        field.classList.remove('field-error');
    }
    if (errEl) {
        errEl.classList.remove('show');
    }
}

// التحقق من الاسم - أحرف عربية فقط
function validateFullName(val) {
    // السماح بالحروف العربية والمسافات فقط
    var arabicPattern = /^[\u0600-\u06FF\s]+$/;
    return arabicPattern.test(val.trim()) && val.trim().length >= 3;
}

// التحقق من الرقم الوطني - 11 خانة وأول خانتين 01-14
function validateNationalId(val) {
    var v = val.trim();
    if (!/^\d{11}$/.test(v)) {
        return false;
    }
    var prefix = parseInt(v.substring(0, 2), 10);
    return prefix >= 1 && prefix <= 14;
}

// التحقق من تاريخ بصيغة yyyy-mm-dd
function validateDate(val) {
    var pattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!pattern.test(val)) {
        return false;
    }
    var d = new Date(val);
    return !isNaN(d.getTime());
}

// التحقق من أن تاريخ النهاية بعد تاريخ البداية
function validateDateOrder(startVal, endVal) {
    if (!validateDate(startVal) || !validateDate(endVal)) {
        return false;
    }
    return new Date(endVal) > new Date(startVal);
}

// التحقق من رقم الموبايل السوري (سيريتل أو MTN)
function validateMobile(val) {
    var v = val.trim();
    // Syriatel: 094xxxxxxx | 096xxxxxxx | 099xxxxxxx | 098xxxxxxx
    // MTN:      091xxxxxxx | 093xxxxxxx
    var pattern = /^09[13469][0-9]{7}$/;
    return pattern.test(v);
}

// التحقق من البريد الإلكتروني (اختياري)
function validateEmail(val) {
    if (val.trim() === '') {
        return true; // اختياري
    }
    var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(val.trim());
}

/* --- حساب الحجز والمبلغ --- */

// حساب عدد الأيام بين تاريخين
function calcDays(startStr, endStr) {
    var start = new Date(startStr);
    var end   = new Date(endStr);
    var diff  = end - start; // بالمللي ثانية
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// تنسيق رقم كمبلغ مالي
function formatMoney(amount) {
    return amount.toLocaleString('ar-SY') + ' ل.س';
}

/* --- إرسال النموذج والتحقق الكامل --- */

// التحقق من نموذج الحجز وعرض نافذة النتيجة
function submitBookingForm() {
    var isValid = true;

    // --- جمع قيم الحقول ---
    var nameVal    = document.getElementById('field-name').value;
    var natIdVal   = document.getElementById('field-natid').value;
    var startVal   = document.getElementById('field-start').value;
    var endVal     = document.getElementById('field-end').value;
    var mobileVal  = document.getElementById('field-mobile').value;
    var emailVal   = document.getElementById('field-email').value;

    // --- مسح الأخطاء القديمة ---
    var fields = ['field-name', 'field-natid', 'field-start', 'field-end', 'field-mobile', 'field-email'];
    var fi;
    for (fi = 0; fi < fields.length; fi++) {
        clearError(fields[fi]);
    }

    // --- التحقق من الاسم (إن أُدخل) ---
    if (nameVal.trim() !== '' && !validateFullName(nameVal)) {
        showError('field-name', 'الاسم يجب أن يحتوي على أحرف عربية فقط (3 أحرف على الأقل)');
        isValid = false;
    }

    // --- التحقق من الرقم الوطني (إلزامي) ---
    if (natIdVal.trim() === '') {
        showError('field-natid', 'الرقم الوطني إلزامي');
        isValid = false;
    } else if (!validateNationalId(natIdVal)) {
        showError('field-natid', 'الرقم الوطني يجب أن يتكون من 11 رقماً وأول خانتين بين 01-14');
        isValid = false;
    }

    // --- التحقق من تاريخ البداية (إلزامي) ---
    if (startVal.trim() === '') {
        showError('field-start', 'تاريخ البداية إلزامي');
        isValid = false;
    } else if (!validateDate(startVal)) {
        showError('field-start', 'صيغة التاريخ يجب أن تكون yyyy-mm-dd');
        isValid = false;
    }

    // --- التحقق من تاريخ النهاية (إلزامي) ---
    if (endVal.trim() === '') {
        showError('field-end', 'تاريخ النهاية إلزامي');
        isValid = false;
    } else if (!validateDate(endVal)) {
        showError('field-end', 'صيغة التاريخ يجب أن تكون yyyy-mm-dd');
        isValid = false;
    } else if (startVal.trim() !== '' && validateDate(startVal) && !validateDateOrder(startVal, endVal)) {
        showError('field-end', 'تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية');
        isValid = false;
    }

    // --- التحقق من رقم الموبايل (إن أُدخل) ---
    if (mobileVal.trim() !== '' && !validateMobile(mobileVal)) {
        showError('field-mobile', 'رقم الموبايل يجب أن يطابق شبكتي Syriatel أو MTN (مثال: 0944123456)');
        isValid = false;
    }

    // --- التحقق من البريد الإلكتروني (إن أُدخل) ---
    if (!validateEmail(emailVal)) {
        showError('field-email', 'صيغة البريد الإلكتروني غير صحيحة');
        isValid = false;
    }

    if (!isValid) {
        return false;
    }

    // --- جمع السيارات المختارة ---
    var checkboxes = document.querySelectorAll('.car-select-cb:checked');
    if (checkboxes.length === 0) {
        alert('الرجاء اختيار سيارة واحدة على الأقل!');
        return false;
    }

    // --- حساب الأيام والمبالغ ---
    var days        = calcDays(startVal, endVal);
    var hasDiscount = days > 7;
    var discountRate = hasDiscount ? 0.10 : 0;

    var totalBeforeDiscount = 0;
    var carsRows = '';

    var ci;
    for (ci = 0; ci < checkboxes.length; ci++) {
        var cb       = checkboxes[ci];
        var model    = cb.getAttribute('data-model');
        var priceDay = parseInt(cb.getAttribute('data-price'), 10);
        var subTotal = priceDay * days;
        totalBeforeDiscount += subTotal;

        carsRows += '<tr>' +
            '<td>' + model + '</td>' +
            '<td>' + days + ' يوم</td>' +
            '<td>' + formatMoney(priceDay) + '</td>' +
            '<td>' + formatMoney(subTotal) + '</td>' +
            '</tr>';
    }

    var discountAmount = Math.round(totalBeforeDiscount * discountRate);
    var totalFinal     = totalBeforeDiscount - discountAmount;

    // --- بناء نافذة النتيجة ---
    var discountHtml = '';
    if (hasDiscount) {
        discountHtml = '<div class="sum-row">' +
            '<span><span class="discount-badge">خصم 10%</span> مدة التأجير تتجاوز 7 أيام</span>' +
            '<span>- ' + formatMoney(discountAmount) + '</span>' +
            '</div>';
    }

    var nameDisplay = nameVal.trim() !== '' ? nameVal.trim() : '—';

    document.getElementById('result-body').innerHTML =
        '<p style="margin-bottom:0.8rem; color: #555;">مقدم الطلب: <strong>' + nameDisplay + '</strong> &nbsp;|&nbsp; ' +
        'فترة التأجير: <strong>' + startVal + '</strong> إلى <strong>' + endVal + '</strong></p>' +
        '<table class="result-table">' +
        '<thead><tr><th>السيارة</th><th>عدد الأيام</th><th>السعر اليومي</th><th>المجموع الجزئي</th></tr></thead>' +
        '<tbody>' + carsRows + '</tbody>' +
        '</table>' +
        '<div class="result-summary">' +
        '<div class="sum-row"><span>المجموع الكلي قبل الخصم</span><span>' + formatMoney(totalBeforeDiscount) + '</span></div>' +
        discountHtml +
        '<div class="sum-row"><span>💰 المبلغ النهائي</span><span>' + formatMoney(totalFinal) + '</span></div>' +
        '</div>';

    // إظهار النافذة
    document.getElementById('result-overlay').classList.add('show');
    return false;
}

// إغلاق نافذة النتيجة
function closeResult() {
    document.getElementById('result-overlay').classList.remove('show');
}

/* --- دوال مساعدة --- */

// إغلاق النافذة عند الضغط خارجها
function initResultOverlay() {
    var overlay = document.getElementById('result-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeResult();
            }
        });
    }
}

// تشغيل الدوال بعد تحميل الصفحة
window.addEventListener('load', function() {
    initResultOverlay();
});
