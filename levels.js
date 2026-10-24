// Bloesemland — de tien levels, één per kernteamlid.
// Rijen: 0 = boven, 13 = onder; de grond ligt standaard op rij 12. Een tegel is 16 px.
// Speler: springt ~3 tegels hoog (rennend 4), overbrugt lopend ~3 en rennend ~6 tegels.
//
// Tegels:  #  grond     B  blok       ?  bloemblok    =  tak (van onderen doorheen)
//          ~  wiebeltak (valt na even staan)           ^  braamstruik (au)
//          |  klimrank  S  !-schakelaar   A  roze schakelblok (aan bij start)
//          a  lila schakelblok (uit bij start)         D  hek (open met de sleutel)
//
// Entiteiten (e): bloem, kaart, hart, taart, check, doel, npc, plat, wolk, bij, veer (springbloem),
//                 wind {w, h}, sleutel, feest (alle teamleden juichen bij de finish).
(function () {
  const LEVELS = [
    {
      naam: "Mirjams tuin", host: "Mirjam", thema: "dag", n: 168,
      bouw({ g, row, col, set, e, start }) {
        g(0, 22); start(2);
        e("npc", 7, 12, { naam: "Mirjam", tekst: ["Hoi Wendy!", "Verzamel bloemen", "en de 5 kaartjes."] });
        for (let x = 10; x <= 13; x++) e("bloem", x, 10);
        set(15, 8, "?"); set(16, 8, "B"); set(17, 8, "?"); set(18, 8, "B"); set(19, 8, "?");
        e("bloem", 16, 7); e("bloem", 18, 7);
        for (let i = 0; i < 4; i++) e("bloem", 23 + i, i === 1 || i === 2 ? 8 : 9);

        g(27, 52);
        row(30, 33, 9, "="); row(35, 38, 6, "=");
        for (let x = 35; x <= 38; x++) e("bloem", x, 5);
        e("kaart", 37, 2);

        row(41, 47, 11, "^");
        row(40, 42, 8, "="); row(46, 48, 8, "=");
        e("bloem", 41, 7); e("bloem", 44, 6); e("bloem", 47, 7);

        g(55, 68);
        col(57, 2, 11, "|");
        row(58, 64, 4, "B");
        for (let x = 59; x <= 62; x++) e("bloem", x, 3);
        e("kaart", 64, 2);
        e("hart", 51, 10);

        set(66, 8, "S");
        e("npc", 61, 12, { naam: "Colin", tekst: ["Kop het !-blok.", "Wat verandert er?"] });
        row(69, 76, 12, "a");
        row(72, 75, 6, "B");
        e("kaart", 73, 5);
        g(77, 94);
        col(79, 9, 11, "A");
        set(85, 8, "S");
        e("check", 89, 12);
        e("hart", 92, 10);

        e("plat", 97, 10, { ax: 2.5, ay: 0, per: 230 });
        e("plat", 104, 8, { ax: 0, ay: 2.5, per: 210 });
        e("plat", 111, 9, { ax: 2.5, ay: 0, per: 250, fase: 1.5 });
        for (let x = 96; x <= 99; x++) e("bloem", x, 7);
        e("kaart", 104, 3);
        e("wolk", 109, 4, { ax: 4, per: 320 });
        for (let x = 110; x <= 113; x++) e("bloem", x, 6);

        g(118, 167);
        e("taart", 122, 11);
        e("npc", 119, 12, { naam: "Mirjam", tekst: ["Taart! Daarmee", "spring je in de", "lucht nog een keer."] });
        row(128, 134, 11, "^");
        row(128, 129, 9, "="); row(133, 134, 9, "=");
        row(130, 132, 3, "B");
        e("kaart", 131, 2);
        e("bloem", 131, 7);
        e("wolk", 145, 6, { ax: 3, per: 260 });
        for (let x = 140; x <= 150; x += 2) e("bloem", x, 10);
        e("doel", 157, 12);
      },
    },

    {
      naam: "Eelco's boomgaard", host: "Eelco", thema: "middag", n: 162,
      bouw({ g, row, col, set, e, start }) {
        g(0, 50); start(2);
        e("npc", 6, 12, { naam: "Eelco", tekst: ["Hoi Wendy!", "Spring op de grote", "bloemen, hup!"] });
        for (let x = 9; x <= 13; x++) e("bloem", x, 10);
        set(14, 8, "?"); set(15, 8, "B"); set(16, 8, "?");
        e("veer", 19, 12);
        row(20, 25, 4, "B");
        for (let x = 21; x <= 24; x++) e("bloem", x, 3);
        e("kaart", 23, 2);

        e("veer", 31, 12);
        col(34, 5, 11, "B");
        for (let i = 0; i < 5; i++) e("bloem", 32 + i, 3 + Math.abs(i - 2));

        row(40, 46, 11, "^");
        row(41, 42, 9, "="); row(45, 46, 9, "=");
        e("bloem", 43, 7);
        e("hart", 48, 10);

        g(51, 70);
        set(53, 10, "B"); set(54, 10, "B");
        set(56, 8, "B"); set(57, 8, "B");
        set(59, 6, "B"); set(60, 6, "B");
        e("bloem", 54, 9); e("bloem", 57, 7);
        e("kaart", 60, 3);
        e("check", 66, 12);

        set(73, 10, "=");
        g(76, 100);
        e("veer", 77, 12);
        col(80, 4, 11, "B");
        e("kaart", 80, 2);
        for (let x = 84; x <= 92; x += 2) e("bloem", x, 10);
        set(88, 8, "?"); set(89, 8, "?"); set(90, 8, "?");

        e("plat", 106, 10, { ax: 3, ay: 0, per: 240 });
        e("bloem", 104, 8); e("bloem", 106, 8); e("bloem", 108, 8);
        e("hart", 98, 10);

        g(113, 161);
        row(116, 128, 11, "^");
        for (const x of [118, 122, 126]) { set(x, 11, "."); e("veer", x, 12); }
        e("kaart", 122, 4);
        for (let x = 117; x <= 127; x += 2) e("bloem", x, 7);

        col(133, 2, 11, "|");
        row(134, 138, 4, "B");
        e("kaart", 137, 3);
        e("bloem", 135, 3);
        e("doel", 152, 12);
      },
    },

    {
      naam: "Sabines bijenhof", host: "Sabine", thema: "dag", n: 144,
      bouw({ g, row, col, set, e, start }) {
        g(0, 18); start(2);
        e("npc", 6, 12, { naam: "Sabine", tekst: ["Hoi Wendy!", "Pas op de bijtjes", "en wiebeltakjes!"] });
        for (let x = 9; x <= 12; x++) e("bloem", x, 10);
        e("bij", 15, 9, { ax: 2, ay: 1, per: 220 });

        row(21, 22, 10, "~"); row(25, 26, 9, "~"); row(29, 30, 10, "~");
        e("bloem", 21, 8); e("bloem", 25, 7); e("bloem", 29, 8);
        e("kaart", 25, 5);

        g(33, 62);
        row(34, 35, 10, "=");
        row(37, 48, 8, "B");
        e("bij", 41, 11, { ax: 2.5, ay: .2, per: 200 });
        e("bij", 46, 11, { ax: 2, ay: .2, per: 170, fase: 2 });
        for (let x = 38; x <= 47; x += 2) e("bloem", x, 11);
        e("bij", 43, 5, { ax: 3, ay: .5, per: 240 });
        e("kaart", 47, 6);
        e("hart", 54, 10);
        e("check", 59, 12);

        row(64, 65, 10, "~"); row(67, 68, 8, "~"); row(70, 71, 6, "~"); row(73, 74, 8, "~"); row(76, 77, 10, "~");
        e("kaart", 70, 3);
        e("bloem", 67, 6); e("bloem", 73, 6);
        e("bij", 72, 3, { ax: 3, ay: .5, per: 260 });

        g(80, 104);
        row(87, 89, 9, "=");
        e("kaart", 88, 7);
        e("bij", 88, 7, { ax: 2.5, ay: 1.6, per: 280 });
        for (let x = 82; x <= 100; x += 3) e("bloem", x, 10);
        set(95, 8, "?"); set(96, 8, "?");

        row(106, 118, 10, "~");
        e("kaart", 112, 6);
        for (let x = 107; x <= 117; x += 2) e("bloem", x, 8);

        g(120, 143);
        e("hart", 124, 10);
        e("doel", 136, 12);
      },
    },

    {
      naam: "Colins kas", host: "Colin", thema: "dag", n: 134,
      bouw({ g, row, col, set, e, start }) {
        g(0, 40); start(2);
        e("npc", 5, 12, { naam: "Colin", tekst: ["Welkom in de kas!", "Zoek de sleutel", "voor het hek."] });
        set(12, 8, "S");
        col(18, 8, 11, "A");
        row(21, 24, 9, "a");
        e("kaart", 22, 7);
        row(26, 30, 6, "B");
        e("sleutel", 29, 5);
        for (let x = 26; x <= 28; x++) e("bloem", x, 5);
        col(36, 0, 11, "D");
        e("bloem", 33, 10); e("bloem", 39, 10);

        row(41, 46, 12, "a"); row(41, 46, 13, "a");
        g(47, 64);
        set(49, 8, "S");
        col(52, 9, 11, "A");
        e("kaart", 52, 6);
        e("npc", 56, 12, { naam: "Colin", tekst: ["Het hek is open!", "En die muur? Kop", "nog eens..."] });
        e("check", 61, 12);

        e("plat", 66, 9, { ax: 0, ay: 3, per: 220 });
        row(68, 73, 3, "B");
        e("kaart", 71, 2);
        for (let x = 68; x <= 72; x++) e("bloem", x, 2);
        g(67, 92);

        set(77, 10, "B");
        row(79, 81, 8, "?");
        e("kaart", 80, 4);
        e("hart", 85, 10);

        e("plat", 97, 10, { ax: 2.5, ay: 0, per: 230 });
        e("bij", 97, 6, { ax: 3, ay: .5, per: 260 });
        e("kaart", 97, 5);
        for (let x = 94; x <= 100; x += 2) e("bloem", x, 8);

        g(103, 133);
        for (let x = 106; x <= 118; x += 3) e("bloem", x, 10);
        e("doel", 126, 12);
      },
    },

    {
      naam: "Renees windheuvel", host: "Renee", thema: "middag", n: 152,
      bouw({ g, row, col, set, e, start }) {
        g(0, 20); start(2);
        e("npc", 6, 12, { naam: "Renee", tekst: ["Voel je de wind?", "Spring erin en", "zweef omhoog!"] });
        for (let x = 9; x <= 12; x++) e("bloem", x, 10);
        e("wind", 21, 3, { w: 4, h: 11 });
        e("kaart", 22, 3);
        for (let y = 5; y <= 9; y += 2) e("bloem", 23, y);
        row(25, 30, 5, "B");
        for (let x = 26; x <= 29; x++) e("bloem", x, 4);
        g(25, 45);

        e("wind", 46, 4, { w: 3, h: 10 });
        row(50, 52, 7, "=");
        e("wind", 54, 4, { w: 3, h: 10 });
        row(58, 60, 7, "=");
        e("wind", 62, 4, { w: 3, h: 10 });
        e("kaart", 55, 4);
        e("wolk", 56, 2, { ax: 4, per: 300 });
        for (const x of [51, 59]) e("bloem", x, 6);

        g(65, 90);
        e("hart", 70, 10);
        e("check", 86, 12);

        e("wind", 91, 1, { w: 3, h: 11 });
        col(94, 2, 11, "B");
        e("kaart", 92, 2);
        g(91, 116);
        for (let x = 96; x <= 102; x += 2) e("bloem", x, 10);

        e("veer", 106, 12);
        e("wind", 107, 1, { w: 3, h: 7 });
        e("kaart", 108, 2);

        e("plat", 120, 9, { ax: 0, ay: 3, per: 220 });
        e("plat", 126, 8, { ax: 0, ay: 3, per: 220, fase: 2 });
        e("kaart", 123, 4);

        g(130, 151);
        e("doel", 144, 12);
      },
    },

    {
      naam: "Chris' regenbos", host: "Chris", thema: "regen", n: 134,
      bouw({ g, row, col, set, e, start }) {
        g(0, 25); start(2);
        e("npc", 5, 12, { naam: "Chris", tekst: ["Het regent hier!", "Hou omhoog vast", "om te klimmen."] });
        col(12, 1, 11, "|");
        row(13, 20, 3, "B");
        for (let x = 14; x <= 18; x++) e("bloem", x, 2);
        e("kaart", 20, 2);
        e("wolk", 17, 0, { ax: 2, per: 260 });

        set(27, 10, "=");
        col(29, 2, 10, "|"); col(33, 2, 10, "|"); col(37, 2, 10, "|");
        e("kaart", 33, 1);
        e("bloem", 31, 5); e("bloem", 35, 5);
        e("npc", 22, 12, { naam: "Chris", tekst: ["Spring van rank", "naar rank en hou", "omhoog ingedrukt."] });

        g(38, 60);
        e("wolk", 45, 10, { ax: 3, per: 240 });
        e("wolk", 53, 10, { ax: 3, per: 200, fase: 1 });
        for (let x = 41; x <= 57; x += 4) e("bloem", x, 7);
        e("hart", 50, 6);
        e("check", 58, 12);

        e("plat", 64, 9, { ax: 0, ay: 3, per: 220 });
        e("plat", 70, 7, { ax: 0, ay: 3, per: 220, fase: 2 });
        e("plat", 76, 9, { ax: 0, ay: 3, per: 220, fase: 4 });
        e("kaart", 73, 4);
        e("wolk", 70, 1, { ax: 3, per: 280 });

        g(81, 110);
        col(88, 1, 11, "|");
        row(89, 96, 2, "=");
        for (let x = 90; x <= 94; x++) e("bloem", x, 1);
        e("kaart", 95, 1);

        row(100, 106, 11, "^");
        row(102, 105, 9, "=");
        e("wolk", 99, 5, { ax: 1.5, per: 200 });
        e("wolk", 108, 5, { ax: 1.5, per: 200, fase: 3 });
        e("kaart", 104, 7);
        set(97, 8, "?");

        g(111, 133);
        e("doel", 124, 12);
      },
    },

    {
      naam: "Jans sterrennacht", host: "Jan", thema: "nacht", n: 152,
      bouw({ g, row, col, set, e, start }) {
        g(0, 18); start(2);
        e("npc", 5, 12, { naam: "Jan", tekst: ["Mooi hè, al die", "sterren? Pas op:", "takjes wiebelen."] });
        for (let x = 8; x <= 12; x++) e("bloem", x, 10);
        row(20, 21, 10, "~"); row(24, 25, 9, "~"); row(28, 29, 10, "~"); row(32, 33, 9, "~");
        e("kaart", 26, 5);
        for (const x of [20, 24, 28, 32]) e("bloem", x, 7);

        g(35, 62);
        e("veer", 40, 12);
        row(42, 47, 4, "B");
        e("kaart", 46, 3);
        for (let x = 43; x <= 45; x++) e("bloem", x, 3);
        row(49, 53, 11, "^");
        row(49, 50, 9, "="); row(53, 54, 9, "=");
        e("check", 58, 12);

        row(64, 65, 10, "~"); row(68, 69, 10, "~"); row(72, 73, 10, "~");
        e("plat", 78, 9, { ax: 2, ay: 0, per: 220 });
        row(83, 84, 8, "~"); row(87, 88, 10, "~");
        e("kaart", 78, 5);
        for (const x of [64, 68, 72, 83, 87]) e("bloem", x, 8);

        g(91, 115);
        col(98, 1, 11, "|");
        row(99, 105, 3, "=");
        e("bij", 102, 1, { ax: 2.5, ay: .4, per: 240 });
        e("kaart", 104, 2);
        e("hart", 110, 10);

        row(117, 118, 10, "~"); row(120, 121, 8, "~"); row(123, 124, 6, "~"); row(126, 127, 8, "~"); row(129, 130, 10, "~");
        e("kaart", 124, 3);

        g(133, 151);
        e("doel", 144, 12);
      },
    },

    {
      naam: "Thomas' takkenrace", host: "Thomas", thema: "dag", n: 158,
      bouw({ g, row, col, set, e, start }) {
        g(0, 30); start(2);
        e("npc", 4, 12, { naam: "Thomas", tekst: ["Klaar voor een", "race? Hou B of", "shift ingedrukt!"] });
        for (let x = 8; x <= 28; x += 2) e("bloem", x, 10);
        for (let i = 0; i < 5; i++) e("bloem", 31 + i, i === 2 ? 7 : 8);
        g(36, 44);
        for (let i = 0; i < 6; i++) e("bloem", 45 + i, [9, 8, 7, 7, 8, 9][i]);
        e("kaart", 48, 6, { inSprong: true });   // te pakken tijdens een rennende sprong
        g(51, 60);
        row(53, 55, 11, "^");
        g(67, 80);
        set(68, 10, "B");
        row(70, 74, 8, "?");
        e("kaart", 72, 6);
        e("check", 78, 12);

        e("plat", 84, 10, { ax: 2, ay: 0, per: 200 });
        e("plat", 91, 8, { ax: 2, ay: 0, per: 200, fase: 2 });
        e("plat", 98, 10, { ax: 2, ay: 0, per: 200, fase: 4 });
        e("plat", 105, 8, { ax: 2, ay: 0, per: 200, fase: 1 });
        e("kaart", 95, 4);
        for (const x of [84, 91, 98, 105]) e("bloem", x, 6);

        g(110, 156);
        row(115, 117, 11, "^"); row(122, 124, 11, "^"); row(129, 131, 11, "^");
        e("kaart", 123, 7);
        e("hart", 119, 10);
        e("veer", 133, 12);
        col(136, 6, 11, "B");
        e("kaart", 136, 4);
        e("doel", 150, 12);
      },
    },

    {
      naam: "Davids zonsondergang", host: "David", thema: "avond", n: 148,
      bouw({ g, row, col, set, e, start }) {
        g(0, 20); start(2);
        e("npc", 5, 12, { naam: "David", tekst: ["Wat een avond!", "Alles wat je", "leerde, komt nu."] });
        e("wind", 21, 3, { w: 4, h: 11 });
        e("kaart", 23, 2);
        row(26, 32, 5, "B");
        for (let x = 27; x <= 31; x++) e("bloem", x, 4);
        g(26, 39);
        set(30, 8, "S");
        col(36, 8, 11, "A");
        row(40, 45, 12, "a"); row(40, 45, 13, "a");

        g(46, 70);
        col(49, 3, 11, "|");
        row(50, 54, 5, "B");
        e("sleutel", 53, 4);
        e("kaart", 51, 3);
        col(60, 0, 11, "D");
        e("check", 66, 12);

        row(73, 74, 10, "=");
        g(76, 77);
        e("veer", 77, 12);
        e("wind", 79, 1, { w: 3, h: 9 });
        e("kaart", 80, 2);
        row(83, 87, 4, "=");
        for (let x = 83; x <= 87; x++) e("bloem", x, 3);

        g(89, 110);
        e("bij", 95, 9, { ax: 2, ay: 1, per: 200 });
        e("bij", 102, 8, { ax: 2, ay: 1, per: 220, fase: 2 });
        row(97, 99, 9, "=");
        e("kaart", 98, 7);
        e("hart", 106, 10);

        row(112, 113, 10, "~"); row(116, 117, 10, "~"); row(120, 121, 10, "~");
        e("kaart", 116, 6);

        g(124, 147);
        e("doel", 140, 12);
      },
    },

    {
      naam: "Daves taartfeest", host: "Dave", thema: "feest", n: 146,
      bouw({ g, row, col, set, e, start }) {
        g(0, 30); start(2);
        e("npc", 5, 12, { naam: "Dave", tekst: ["Welkom op het", "taartfeest! Pak", "alle kaartjes."] });
        e("taart", 10, 11);
        col(16, 7, 11, "B");
        e("kaart", 16, 5);
        e("veer", 21, 12);
        row(23, 29, 4, "B");
        for (let x = 24; x <= 28; x++) e("bloem", x, 3);
        e("kaart", 29, 3);

        g(31, 50);
        for (let x = 33; x <= 49; x += 2) e("bloem", x, 10);
        e("wind", 53, 2, { w: 3, h: 12 });
        e("kaart", 54, 2);
        g(57, 80);
        row(62, 70, 11, "^");
        row(63, 64, 9, "="); row(68, 69, 9, "=");
        e("bij", 66, 6, { ax: 1.5, ay: 1, per: 200 });
        e("kaart", 66, 4);
        e("check", 76, 12);

        row(84, 85, 9, "~"); row(90, 91, 9, "~");
        e("kaart", 88, 4);
        for (const x of [84, 90]) e("bloem", x, 7);

        g(95, 145);
        e("feest", 104, 12);
        e("doel", 138, 12);
      },
    },
  ];

  if (typeof module !== "undefined") module.exports = LEVELS;
  else window.BLOESEM_LEVELS = LEVELS;
})();
