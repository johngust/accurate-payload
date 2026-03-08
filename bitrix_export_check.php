//title: Export Check
CModule::IncludeModule("iblock");

$iblock_id = 14; 
$db_res = CIBlockElement::GetList(
    array("ID"=>"ASC"), 
    array("IBLOCK_ID" => $iblock_id), 
    false, 
    array("nTopCount" => 10), 
    array("ID", "NAME", "DETAIL_PICTURE", "DETAIL_TEXT", "IBLOCK_SECTION_ID")
);

while($res = $db_res->GetNext()) {
    $img_path = CFile::GetPath($res["DETAIL_PICTURE"]);
    echo "ID: " . $res["ID"] . " | NAME: " . $res["NAME"] . " | IMAGE: " . ($img_path ? $img_path : "НЕТ КАРТИНКИ") . " | SECTION: " . $res["IBLOCK_SECTION_ID"] . "<br>";
}
