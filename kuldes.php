<?php
/* Quickhouse – ajánlatkérő űrlap feldolgozása.
   Beállítás: a CÍMZETT-et élesítéskor cseréld a cég címére (pl. info@quickhouse.hu). */
const CIMZETT = 'mullerdanielev@gmail.com';
const FELADO  = 'noreply@quickhouse.hu';   // a domainhez tartozó cím, különben a levél könnyen spamba kerül
const TARGY   = 'Új ajánlatkérés a quickhouse.hu oldalról';

header('X-Content-Type-Options: nosniff');
$ajax = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function vege($ok, $uzenet, $ajax, $kod = 200) {
    if ($ajax) {
        http_response_code($kod);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $uzenet], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: kapcsolat.html?kuldes=' . ($ok ? 'ok' : 'hiba') . '#ajanlatkeres', true, 303);
    }
    exit;
}
function tiszta($s, $max) {
    $s = trim((string)$s);
    $s = str_replace(["\r", "\0"], '', $s);
    return mb_substr($s, 0, $max, 'UTF-8');
}
function fejlec($s) { return trim(preg_replace('/[\r\n]+/', ' ', $s)); }   // fejléc-injektálás ellen

if ($_SERVER['REQUEST_METHOD'] !== 'POST') vege(false, 'Érvénytelen kérés.', $ajax, 405);

/* Botok: rejtett mező kitöltve, vagy túl gyors (<3 mp) beküldés. Nekik is „sikert” mutatunk. */
if (tiszta($_POST['weboldal'] ?? '', 10) !== '') vege(true, 'Köszönjük!', $ajax);
$ido = (int)($_POST['ts'] ?? 0);
if ($ido > 0 && (time() - intdiv($ido, 1000)) < 3) vege(true, 'Köszönjük!', $ajax);

$nev     = tiszta($_POST['name'] ?? '', 120);
$telefon = tiszta($_POST['phone'] ?? '', 40);
$email   = tiszta($_POST['email'] ?? '', 160);
$tipus   = tiszta($_POST['type'] ?? '', 80);
$telek   = tiszta($_POST['plot'] ?? '', 40);
$uzenet  = tiszta($_POST['msg'] ?? '', 4000);
$hozzajarul = !empty($_POST['consent']);

if ($nev === '' || $telefon === '' || $email === '' || $tipus === '' || $telek === '' || $uzenet === '' || !$hozzajarul) vege(false, 'Kérjük, minden mezőt töltsön ki, és fogadja el az adatkezelési tájékoztatót.', $ajax, 422);
if (!preg_match('/^[0-9 +().\/-]{6,40}$/', $telefon)) vege(false, 'A telefonszám formátuma érvénytelen.', $ajax, 422);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) vege(false, 'Az e-mail cím formátuma érvénytelen.', $ajax, 422);

/* Egyszerű korlát: egy IP legfeljebb 5 beküldés / óra (ideiglenes fájl alapján). */
$ip = $_SERVER['REMOTE_ADDR'] ?? 'ismeretlen';
$fajl = sys_get_temp_dir() . '/qh_rl_' . md5($ip);
$mostani = [];
if (is_file($fajl)) $mostani = array_filter(array_map('intval', explode(',', (string)file_get_contents($fajl))), function ($t) { return $t > time() - 3600; });
if (count($mostani) >= 5) vege(false, 'Túl sok kérés érkezett. Kérjük, próbálja újra később, vagy hívjon minket telefonon.', $ajax, 429);
$mostani[] = time();
@file_put_contents($fajl, implode(',', $mostani));

$torzs  = "Új ajánlatkérés érkezett a quickhouse.hu oldalról.\n\n";
$torzs .= "Név: $nev\nTelefon: $telefon\nE-mail: " . ($email !== '' ? $email : '(nem adta meg)') . "\n";
$torzs .= "Mire kell a ház: " . ($tipus ?: '-') . "\nVan telke: " . ($telek ?: '-') . "\n\nÜzenet:\n" . ($uzenet !== '' ? $uzenet : '-') . "\n\n";
$torzs .= "Az adatkezelési tájékoztatót elfogadta: igen\nBeküldés ideje: " . date('Y-m-d H:i:s') . "\n";

$fejlec  = "From: Quickhouse weboldal <" . FELADO . ">\r\n";
$fejlec .= "Reply-To: " . fejlec($nev) . " <" . fejlec($email) . ">\r\n";
$fejlec .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\n";

$targy = '=?UTF-8?B?' . base64_encode(TARGY) . '?=';
$sikeres = mail(CIMZETT, $targy, $torzs, $fejlec);
if (!$sikeres) vege(false, 'A küldés most nem sikerült. Kérjük, hívjon minket telefonon, vagy írjon az info@quickhouse.hu címre.', $ajax, 500);
vege(true, 'Köszönjük, megkaptuk az ajánlatkérését. Hamarosan jelentkezünk.', $ajax);
