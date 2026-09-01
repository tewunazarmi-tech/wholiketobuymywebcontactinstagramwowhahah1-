/* ================================================================
   MAWLYNGBNA ADVENTURE — SITE CONFIG
   ⭐ THIS IS THE ONLY FILE YOU SHOULD EVER NEED TO EDIT BY HAND. ⭐

   You do NOT need to know how to code to use this file.
   To change a PRICE: find the number and type a new number.
   To change WORDS: find the words between " " and type new words
   between the same " " marks.

   THE ONLY RULE: only change what is between the quotes " " or
   the plain numbers. Never delete a comma ",", a colon ":", or a
   curly bracket "{ }" — those are what hold the file together.
   If you're ever unsure, copy this whole file somewhere safe
   before you start editing, so you can always undo mistakes.

   Everything here can ALSO be edited live from the Admin
   Dashboard (open admin.html on your site) without touching this
   file at all — see README.md for when to use which.
   ================================================================ */


/* ================================================================
   JUMP TO WHAT YOU NEED — search this file (Ctrl+F) for the label
   ================================================================
     WHATSAPP NUMBER      → where booking messages get sent
     ACTIVITIES            → the list of adventure packages & prices
     CHILD PRICE FOR ACTIVITIES → the flat ₹ charge for a child
     HOW MANY PEOPLE       → min/max people a visitor can pick
     HOME STAY              → the home stay + breakfast add-on
     CAMPING                → the camping add-on
     TEXT ON THE FORM        → every single word/sentence visitors see
     PAYMENT DETAILS        → your UPI / bank / QR info
     ADMIN PASSWORD          → the password for the admin dashboard
   ================================================================ */

const DEFAULT_CONFIG = {

  /* ---------------------------------------------------------------
     HEADER TEXT
     The big title and the smaller line under it, at the very top
     of the booking page.
  ----------------------------------------------------------------- */
  formTitle: "Book Your Mawlyngbna Adventure Activities With Us",
  formSubtitle: "Fill in your details below to reserve your adventure experience",


  /* ---------------------------------------------------------------
     WHATSAPP NUMBER
     The visitor's booking always gets sent to THIS number when
     they tap Submit. It must be digits only — no "+", no spaces,
     no dashes — starting with the country code.

     EXAMPLE: an Indian mobile number 98765 43210 becomes:
        "919876543210"
        (91 = India's country code, then the 10-digit number)
  ----------------------------------------------------------------- */
  whatsappNumber: "916909659928",


  /* ---------------------------------------------------------------
     ACTIVITIES  (the visitor picks ONE of these — every activity is
     priced PER PERSON)

     Each line is one activity. To change its price, change the
     number after price:  — that is what ONE ADULT pays.

     Every child (below 17) pays the flat child price set further
     down (see "CHILD PRICE FOR ACTIVITIES"), EXCEPT for any
     activity that has  childPaysFullPrice: true  added to its line
     — for that one activity, a child pays the SAME price as an
     adult instead of the flat child price. Right now that's only
     "Water falls" (₹100), since ₹600 flat would cost MORE than the
     ₹100 adult price.

     TO ADD A NEW ACTIVITY: copy a whole line (from { to },) and
     paste it as a new line, then edit its id/label/price.
     TO REMOVE AN ACTIVITY: delete its whole line.

     "id" just has to be different for every activity — it's never
     shown to visitors, so the easiest thing is to leave the
     existing ids alone and just make new ones follow the pattern
     "pkg7", "pkg8", etc. when you add activities.
  ----------------------------------------------------------------- */
  packages: [
    { id: "pkg1", label: "Canyoning + kayaking",                      price: 1050 },
    { id: "pkg2", label: "Canyoning + kayaking + split rock",         price: 1200 },
    { id: "pkg3", label: "Canyoning",                                  price: 850  },
    { id: "pkg4", label: "Canyoning + split rock",                     price: 1000 },
    { id: "pkg5", label: "Canyoning + kayaking + split rock + lunch",  price: 1500 },
    { id: "pkg6", label: "Water falls",                                price: 100, childPaysFullPrice: true }
  ],


  /* ---------------------------------------------------------------
     CHILD PRICE FOR ACTIVITIES
     A flat charge (in rupees) for EVERY child (below 17) on
     whichever activity was picked — the same amount no matter which
     activity, EXCEPT activities marked childPaysFullPrice: true
     above (those charge the child the normal adult price instead).

     Just change the number below.
  ----------------------------------------------------------------- */
  pricing: {
    childFlatPrice: 600
  },


  /* ---------------------------------------------------------------
     HOW MANY PEOPLE
     The lowest and highest numbers the + / − buttons will allow
     for "Number of participants" and "Number of child".
  ----------------------------------------------------------------- */
  limits: {
    minParticipants: 1,
    maxParticipants: 50,
    minChildren: 0,
    maxChildren: 50
  },


  /* ---------------------------------------------------------------
     HOME STAY  (an optional add-on the visitor can say yes/no to —
     includes breakfast: Maggi & roti)

       enabled            → true shows this question on the form,
                             false hides it completely
       title              → the heading shown to visitors
       note               → the small grey description line under
                             the title
       firstPersonPrice   → the price for the 1st person in the
                             booking
       extraPersonPrice   → the extra price added for EACH person
                             after the first, in the SAME booking

     HOW CHILDREN (below 17) ARE CHARGED FOR HOME STAY:
       • If the booking has at least 1 adult, every child staying
         with them is FREE.
       • If the booking is children ONLY (0 adults), the children
         are charged exactly like adults would be — firstPersonPrice
         for the first child, extraPersonPrice for every child after
         that.

     EXAMPLE with the numbers below:
       2 adults + 1 child (traveling with the adults) = ₹1500 +
       ₹500 = ₹2000. The child is free because adults are present.

       3 children traveling ALONE (no adult) = ₹1500 + ₹500 + ₹500
       = ₹2500 — same as if they were 3 adults.
  ----------------------------------------------------------------- */
  homestay: {
    enabled: true,
    title: "Home Stay + Breakfast (Maggi & Roti)",
    note: "double bed with attach bathroom, breakfast included (Maggi & roti)",
    firstPersonPrice: 1500,
    extraPersonPrice: 500
  },


  /* ---------------------------------------------------------------
     CAMPING  (same kind of add-on as Home Stay, above)
  ----------------------------------------------------------------- */
  camping: {
    enabled: true,
    title: "Camping",
    price: 1500,
    note: "camping and bon fire, per person",
    perPerson: true
  },


  /* ---------------------------------------------------------------
     TEXT ON THE FORM
     EVERY word and sentence a visitor can see on the booking page
     lives here — every label, placeholder, note, error message,
     and button. Nothing is hard-coded in the HTML anymore: change
     any line below (between the quotes) and that exact text
     changes on the live site.

     Grouped by where it appears, top of the page to bottom. Leave
     any line exactly as-is if you don't want to change it.
  ----------------------------------------------------------------- */
  labels: {

    // ----- Top of page 1 -----
    topNote: "START YOUR ADVENTURE JOURNEY.",
    requiredNote: "* Indicates required question",
    page1Indicator: "Page 1 of 2",
    page2Indicator: "Page 2 of 2",

    // ----- Name -----
    nameLabel: "Name",
    namePlaceholder: "Your answer",
    nameError: "Please enter your name.",

    // ----- WhatsApp number -----
    whatsappLabel: "WhatsApp Number",
    whatsappPlaceholder: "e.g. 9863012345",
    whatsappError: "Please enter a valid phone number (at least 10 digits).",

    // ----- Date of visit -----
    dateLabel: "Date of visit",
    dateError: "Please choose a date.",

    // ----- Participants / children -----
    participantsLabel: "Number of participants",
    childrenLabel: "Number of child",

    // ----- Package question -----
    packageQuestionLabel: "Package for Mawlyngbna Adventure (select one or more)",
    // Shown just under the package question, above the list of
    // activities. {price} is replaced automatically with the flat
    // child price set in pricing.childFlatPrice above.
    packageChildNote: "Note: Children below 17 years of age will be charged \u20B9{price} per child on every activity, except Water falls (children pay the same per-person price as adults).",
    packageError: "Please select at least one package.",
    perPersonText: "per person",

    // ----- Home Stay / Camping shared -----
    // The "note : " that comes right before each add-on's note text.
    notePrefix: "note : ",
    // The yes/no radio options for Home Stay and Camping (kept as
    // separate lines since the original form capitalized them
    // differently — change either one freely).
    homestayYesOption: "yes",
    homestayNoOption: "No",
    campingYesOption: "yes",
    campingNoOption: "no",

    // ----- Home Stay: number of people staying (shown once "yes" is picked) -----
    // These can be a DIFFERENT headcount than "Number of participants" /
    // "Number of child" above, since not everyone booking an activity
    // necessarily also stays the night.
    homestayAdultsLabel: "Number of adults for home stay",
    homestayChildrenLabel: "Number of children for home stay (below 17)",

    // ----- Special request -----
    specialLabel: "Any special request",
    specialPlaceholder: "Your answer",

    // ----- Payment mode question (page 1) -----
    paymentModeLabel: "Payment mode",
    paymentModeError: "Please select a payment mode.",
    payUpiOption: "UPI ID",
    payBankOption: "Bank Transfer",
    payQrOption: "QR Code",

    // ----- Page 1 buttons -----
    clearFormBtn: "Clear form",
    nextBtn: "Next",

    // ----- Page 2 heading -----
    page2Title: "Payment",

    // ----- Page 2: UPI detail block -----
    payUpiHeading: "UPI ID",
    upiIdRowLabel: "UPI ID :",

    // ----- Page 2: Bank detail block -----
    payBankHeading: "Bank Transfer",
    accountRowLabel: "Account :",
    ifscRowLabel: "IFSC :",

    // ----- Page 2: QR detail block -----
    payQrHeading: "QR Code",
    scanAndPayText: "scan and pay",
    downloadQrBtn: "Download QR",
    copyUpiBtn: "Copy UPI ID",

    // ----- Copy buttons (used next to UPI ID / Account / IFSC) -----
    copyBtnText: "Copy",
    copiedBtnText: "Copied!",

    // ----- Live total box -----
    estimatedTotalLabel: "Estimated total",
    totalLabel: "Total",
    totalFooterNote: "Final booking will be confirmed with you on WhatsApp.",
    emptyBreakdownNote: "Select a package to see pricing",

    // ----- Page 2 buttons -----
    backBtn: "Back",
    submitBtn: "Submit",

    // ----- Pop-up messages (toasts) -----
    fillRequiredToast: "Please fill in all required fields.",
    copiedToastPrefix: "Copied: ",

    // ----- Words used inside the price breakdown lines -----
    // e.g. "Canyoning × 2 adults" / "2 child × ₹600"
    adultWord: "adult",
    adultsWord: "adults",
    personWord: "person",
    peopleWord: "people",
    childWord: "child",
    childrenWord: "children",
    freeText: "free",
    // Shown next to a free child home stay line.
    homeStayFreeWithAdultText: "(free, travelling with an adult)",
    // Shown when children book home stay with no adult present, so
    // they're charged the same as adults would be.
    homeStayChargedAsAdultText: "(no adult in booking, charged as adult)"
  },


  /* ---------------------------------------------------------------
     PAYMENT DETAILS
     What visitors see on the payment page, depending on which
     payment method they chose (UPI ID / Bank Transfer / QR Code).
  ----------------------------------------------------------------- */
  payment: {
    accountName: "Aibanskhem Kharnaior",
    upiId: "aibanskhemkharnaior@okaxis",
    bankName: "Meghalaya Rural Bank 0869",
    bankAccount: "95507467578",
    bankIFSC: "SBIN006740",
    // The QR code image visitors see and can download. Put your
    // file at assets/qr.png (replacing the existing one) and leave
    // this line exactly as it is — or paste a different image web
    // address here instead.
    qrImageUrl: "assets/qr.png"
  },


  /* ---------------------------------------------------------------
     ADMIN PASSWORD
     Protects the hidden admin dashboard (admin.html) on this
     device/browser. Change this to your own password before you
     go live — anything you'll remember works.
  ----------------------------------------------------------------- */
  adminPassword: "mawlyngbna2026"

};


/* ================================================================
   HOW THE PRICE CALCULATOR WORKS (nothing to edit here — just
   read this if you want to understand the numbers on the site)
   ================================================================

   For every booking, the total is added up like this:

     1. For EACH activity the visitor ticks:
          Activity price  ×  Number of adults
            e.g. ₹1050 × 2 adults = ₹2100

          Children on that activity:
            - if the activity has childPaysFullPrice: true →
              Activity price × Number of children
              (e.g. Water falls: ₹100 × 1 child = ₹100)
            - otherwise →
              pricing.childFlatPrice × Number of children
              (e.g. ₹600 × 1 child = ₹600)

          A visitor can tick more than one activity — each ticked
          activity adds its own line to the total.

     2. + Home stay, IF the visitor said yes. Home stay has its OWN
          adult/child headcount (set with its own +/− buttons — it
          doesn't have to match "Number of participants" above,
          since not everyone booking an activity necessarily also
          stays the night):
          - firstPersonPrice for the 1st home-stay adult, +
            extraPersonPrice for every home-stay adult after that
          - home-stay children are FREE if there's at least 1
            home-stay adult
          - if home stay is booked for children ONLY (0 home-stay
            adults), those children are charged firstPersonPrice /
            extraPersonPrice exactly like adults would be

     3. + Camping price, IF the visitor said yes
          (× number of people, only if perPerson is true above —
          uses the main "Number of participants" / "Number of
          child" counts, not the home-stay ones)

     Total = step 1 + step 2 + step 3

   This happens automatically — you never calculate anything
   yourself. You only ever change the numbers above (activity
   prices, the flat child price, and the add-on prices), and the
   site recalculates the total live as the visitor fills the form.
   ================================================================ */
