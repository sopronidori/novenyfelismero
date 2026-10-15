// A 65 növény adatai. Itt módosíthatod a neveket és a képek útvonalát.
// A képek a kepek/ mappában maradnak.
const data = [
  {
    "id": 1,
    "hu": "Bibircses nyír",
    "la": "Betula pendula",
    "img": "kepek/01.jpg"
  },
  {
    "id": 2,
    "hu": "Bugás csörgőfa",
    "la": "Koelreuteria paniculata",
    "img": "kepek/02.jpg"
  },
  {
    "id": 3,
    "hu": "Csavart fűz",
    "la": "Salix matsudana 'Tortuosa'",
    "img": "kepek/03.jpg",
    "alternatives": {"hu": ["Spirálfűz"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 4,
    "hu": "Csertölgy",
    "la": "Quercus cerris",
    "img": "kepek/04.jpg"
  },
  {
    "id": 5,
    "hu": "Csüngő eperfa",
    "la": "Morus alba 'Pendula'",
    "img": "kepek/05.jpg",
    "alternatives": {"hu": ["Szomorú eperfa", "Csüngő ágú eperfa"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 6,
    "hu": "Csüngő japánakác",
    "la": "Styphnolobium japonicum 'Pendula'",
    "img": "kepek/06.jpg",
    "alternatives": {"hu": ["Csüngő ágú japánakác"]},
    "alternativeLabel": "V. (másik megnevezés)",
    "note": "A pagodafa a jegyzék szerint hétköznapi elnevezés; nem jelölt UA./elfogadható változat."
  },
  {
    "id": 7,
    "hu": "Mézgás éger",
    "la": "Alnus glutinosa",
    "img": "kepek/07.jpg"
  },
  {
    "id": 8,
    "hu": "Erdeifenyő",
    "la": "Pinus sylvestris",
    "img": "kepek/08.jpg"
  },
  {
    "id": 9,
    "hu": "Ezüst hárs",
    "la": "Tilia tomentosa",
    "img": "kepek/09.jpg"
  },
  {
    "id": 10,
    "hu": "Ezüst juhar",
    "la": "Acer saccharinum",
    "img": "kepek/10.jpg"
  },
  {
    "id": 11,
    "hu": "Fehér akác",
    "la": "Robinia pseudoacacia",
    "img": "kepek/11.jpg"
  },
  {
    "id": 12,
    "hu": "Fehér eperfa",
    "la": "Morus alba",
    "img": "kepek/12.jpg",
    "alternatives": {"hu": ["Fehér eper"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 13,
    "hu": "Fehér fűz",
    "la": "Salix alba",
    "img": "kepek/13.jpg"
  },
  {
    "id": 14,
    "hu": "Fehér nyár",
    "la": "Populus alba",
    "img": "kepek/14.jpg"
  },
  {
    "id": 15,
    "hu": "Fekete dió",
    "la": "Juglans nigra",
    "img": "kepek/15.jpg"
  },
  {
    "id": 16,
    "hu": "Fekete eperfa",
    "la": "Morus nigra",
    "img": "kepek/16.jpg",
    "alternatives": {"hu": ["Fekete eper"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 17,
    "hu": "Fekete nyár",
    "la": "Populus nigra",
    "img": "kepek/17.jpg"
  },
  {
    "id": 18,
    "hu": "Feketefenyő",
    "la": "Pinus nigra",
    "img": "kepek/18.jpg"
  },
  {
    "id": 19,
    "hu": "Gömbakác",
    "la": "Robinia pseudoacacia 'Umbraculifera'",
    "img": "kepek/19.jpg",
    "alternatives": {"hu": ["Gömbkoronájú fehér akác"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 20,
    "hu": "Gömbkőris",
    "la": "Fraxinus ornus 'Mecsek'",
    "img": "kepek/20.jpg",
    "alternatives": {"hu": ["Gömbkoronájú virágos kőris"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 21,
    "hu": "Gömbszivarfa",
    "la": "Catalpa bignonioides 'Nana'",
    "img": "kepek/21.jpg",
    "alternatives": {"hu": ["Gömbkoronájú szivarfa"]},
    "alternativeLabel": "UA. (ugyanaz)"
  },
  {
    "id": 22,
    "hu": "Hegyi juhar",
    "la": "Acer pseudoplatanus",
    "img": "kepek/22.jpg"
  },
  {
    "id": 23,
    "hu": "Japán díszcseresznye",
    "la": "Prunus serrulata 'Kanzan'",
    "img": "kepek/23.jpg",
    "alternatives": {"hu": ["Japáncseresznye"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 24,
    "hu": "Jegenyenyár",
    "la": "Populus nigra cv. Italica",
    "img": "kepek/24.jpg"
  },
  {
    "id": 25,
    "hu": "Keskenylevelű ezüstfa",
    "la": "Elaeagnus angustifolia",
    "img": "kepek/25.jpg"
  },
  {
    "id": 26,
    "hu": "Keskenylevelű kőris",
    "la": "Fraxinus angustifolia",
    "img": "kepek/26.jpg"
  },
  {
    "id": 27,
    "hu": "Kínai díszkörte",
    "la": "Pyrus calleryana 'Chanticleer'",
    "img": "kepek/27.jpg",
    "alternatives": {"hu": ["Kínaikörte"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 28,
    "hu": "Kínai nyár",
    "la": "Populus simonii",
    "img": "kepek/28.jpg"
  },
  {
    "id": 29,
    "hu": "Kislevelű hárs",
    "la": "Tilia cordata",
    "img": "kepek/29.jpg"
  },
  {
    "id": 30,
    "hu": "Kocsányos tölgy",
    "la": "Quercus robur",
    "img": "kepek/30.jpg"
  },
  {
    "id": 31,
    "hu": "Valódi kocsánytalan tölgy",
    "la": "Quercus petraea",
    "img": "kepek/31.jpg"
  },
  {
    "id": 32,
    "hu": "Korai juhar",
    "la": "Acer platanoides",
    "img": "kepek/32.jpg"
  },
  {
    "id": 33,
    "hu": "Közönséges borostyán",
    "la": "Hedera helix",
    "img": "kepek/33.jpg"
  },
  {
    "id": 34,
    "hu": "Közönséges bükk",
    "la": "Fagus sylvatica",
    "img": "kepek/34.jpg"
  },
  {
    "id": 35,
    "hu": "Közönséges dió",
    "la": "Juglans regia",
    "img": "kepek/35.jpg"
  },
  {
    "id": 36,
    "hu": "Közönséges gyertyán",
    "la": "Carpinus betulus",
    "img": "kepek/36.jpg"
  },
  {
    "id": 37,
    "hu": "Közönséges lucfenyő",
    "la": "Picea abies",
    "img": "kepek/37.jpg"
  },
  {
    "id": 38,
    "hu": "Japánakác",
    "la": "Styphnolobium japonicum",
    "img": "kepek/38.jpg"
  },
  {
    "id": 39,
    "hu": "Platán",
    "la": "Platanus x hispanica",
    "img": "kepek/39.jpg",
    "alternatives": {"hu": ["Juharlevelű platán", "Közönséges platán"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 40,
    "hu": "Tiszafa",
    "la": "Taxus baccata",
    "img": "kepek/40.jpg"
  },
  {
    "id": 41,
    "hu": "Vadgesztenye",
    "la": "Aesculus hippocastanum",
    "img": "kepek/41.jpg"
  },
  {
    "id": 42,
    "hu": "Magas kőris",
    "la": "Fraxinus excelsior",
    "img": "kepek/42.jpg"
  },
  {
    "id": 43,
    "hu": "Magyar tölgy",
    "la": "Quercus conferta",
    "img": "kepek/43.jpg"
  },
  {
    "id": 44,
    "hu": "Mezei juhar",
    "la": "Acer campestre",
    "img": "kepek/44.jpg"
  },
  {
    "id": 45,
    "hu": "Mirigyes bálványfa",
    "la": "Ailanthus altissima",
    "img": "kepek/45.jpg"
  },
  {
    "id": 46,
    "hu": "Császárfa",
    "la": "Paulownia tomentosa",
    "img": "kepek/46.jpg",
    "alternatives": {"hu": ["Kínai császárfa"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 47,
    "hu": "Nagylevelű hárs",
    "la": "Tilia platyphyllos",
    "img": "kepek/47.jpg"
  },
  {
    "id": 48,
    "hu": "Nagyvirágú liliomfa",
    "la": "Magnolia x soulangeana",
    "img": "kepek/48.jpg"
  },
  {
    "id": 49,
    "hu": "Narancseper",
    "la": "Maclura pomifera",
    "img": "kepek/49.jpg",
    "alternatives": {"hu": ["Oszázsnarancs"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 50,
    "hu": "Nyugati ostorfa",
    "la": "Celtis occidentalis",
    "img": "kepek/50.jpg"
  },
  {
    "id": 51,
    "hu": "Oszlopos kocsányos tölgy",
    "la": "Quercus robur 'Fastigiata'",
    "img": "kepek/51.jpg"
  },
  {
    "id": 52,
    "hu": "Páfrányfenyő",
    "la": "Ginkgo biloba",
    "img": "kepek/52.jpg"
  },
  {
    "id": 53,
    "hu": "Pirosvirágú vadgesztenye",
    "la": "Aesculus x carnea 'Briotii'",
    "img": "kepek/53.jpg"
  },
  {
    "id": 54,
    "hu": "Szívlevelű szivarfa",
    "la": "Catalpa bignonioides",
    "img": "kepek/54.jpg"
  },
  {
    "id": 55,
    "hu": "Ezüstfenyő",
    "la": "Picea glauca var. glauca",
    "img": "kepek/55.jpg"
  },
  {
    "id": 56,
    "hu": "Fehér-rózsaszín tarka levelű zöldjuhar",
    "la": "Acer negundo 'Flamingo'",
    "img": "kepek/56.jpg"
  },
  {
    "id": 57,
    "hu": "Ecetfa",
    "la": "Rhus typhina",
    "img": "kepek/57.jpg",
    "alternatives": {"hu": ["Torzsás ecetfa"]},
    "alternativeLabel": "ELFOGADHATÓ",
    "note": "A törzsás szömörce a jegyzékben népi elnevezésként szerepel, nem külön elfogadható válaszként."
  },
  {
    "id": 58,
    "hu": "Törökmogyoró",
    "la": "Corylus colurna",
    "img": "kepek/58.jpg"
  },
  {
    "id": 59,
    "hu": "Tövises lepényfa",
    "la": "Gleditsia triacanthos",
    "img": "kepek/59.jpg",
    "alternatives": {"hu": ["Lepényfa"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 60,
    "hu": "Vénic szil",
    "la": "Ulmus laevis",
    "img": "kepek/60.jpg"
  },
  {
    "id": 61,
    "hu": "Vérszilva",
    "la": "Prunus cerasifera 'Nigra'",
    "img": "kepek/61.jpg",
    "alternatives": {"la": ["Prunus cerasifera 'Woodii'"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 62,
    "hu": "Virágos kőris",
    "la": "Fraxinus ornus",
    "img": "kepek/62.jpg"
  },
  {
    "id": 63,
    "hu": "Vörös tölgy",
    "la": "Quercus rubra",
    "img": "kepek/63.jpg",
    "alternatives": {"hu": ["Amerikai vörös tölgy"]},
    "alternativeLabel": "ELFOGADHATÓ"
  },
  {
    "id": 64,
    "hu": "Zöld juhar",
    "la": "Acer negundo",
    "img": "kepek/64.jpg"
  },
  {
    "id": 65,
    "hu": "Zselnicemeggy",
    "la": "Prunus padus",
    "img": "kepek/65.jpg"
  }
];
