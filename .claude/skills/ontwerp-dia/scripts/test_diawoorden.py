from diawoorden import meet, main

DIA = '''
  <p class="eyebrow">Voor we beginnen</p>
  <h2>Eerst de vraag, het antwoord duurt anderhalf uur</h2>
  <p>Acht concepten, <a href="x.html">één casus</a>.</p>
  <ul><li><b>Eén.</b> Kort.</li><li>Twee</li></ul>
  <svg viewBox="0 0 10 10"><text>omzet</text><text>kosten</text></svg>
  <div class="notes">
    <p class="t">Regie</p>
    <p>Lees de vraag hardop voor; dat duurt tien seconden en het is de enige tien seconden waarin de hele zaal hetzelfde denkt.</p>
  </div>
'''


def test_kop_eyebrow_en_notities_tellen_niet_mee():
    m = meet(DIA)
    assert m["kop"] == "Eerst de vraag, het antwoord duurt anderhalf uur"
    assert m["kop_woorden"] == 8
    assert m["woorden"] == 9      # 5 in de alinea, 2 in de opsomming, 2 in de svg
    assert m["opsomming"] == 2


def test_figuurtekst_staat_apart_en_kan_eruit():
    assert meet(DIA)["figuur"] == 2
    assert meet(DIA, met_figuur=False)["woorden"] == 7


def test_opsommingspunten_zijn_losse_zinnen():
    assert meet(DIA)["langste_zin"] == 4   # "Acht concepten, één casus"


def test_titeldia_met_h1():
    m = meet('<h1>Introductie<br>Bedrijfskunde</h1><p class="lead">Een vraag zonder antwoord.</p>')
    assert m["kop_woorden"] == 2
    assert m["woorden"] == 4


def test_afsluitcode(tmp_path):
    deck = tmp_path / "college.html"
    deck.write_text('<section class="slide" data-title="Proef">' + DIA + "</section>")
    assert main([str(deck)]) == 0
    assert main([str(deck), "--max-woorden", "5"]) == 1
