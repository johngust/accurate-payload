//title: Create Helper Script
$script_content = '<?
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");
CModule::IncludeModule("iblock");
$data = array("categories" => array(), "products" => array());
$iblock_id = 2;

$db_sections = CIBlockSection::GetList(array("left_margin" => "asc"), array("IBLOCK_ID" => $iblock_id));
while($sect = $db_sections->Fetch()) {
    $data["categories"][] = array("ID" => $sect["ID"], "NAME" => $sect["NAME"], "PARENT_ID" => $sect["IBLOCK_SECTION_ID"]);
}

$db_res = CIBlockElement::GetList(array("ID"=>"ASC"), array("IBLOCK_ID" => $iblock_id), false, array("nTopCount" => 500), array("ID", "NAME", "DETAIL_PICTURE", "DETAIL_TEXT", "IBLOCK_SECTION_ID"));
while($res = $db_res->Fetch()) {
    $img = CFile::GetPath($res["DETAIL_PICTURE"]);
    $data["products"][] = array(
        "ID" => $res["ID"], 
        "NAME" => $res["NAME"], 
        "IMAGE" => $img ? "https://".$_SERVER["HTTP_HOST"].$img : "", 
        "DESCRIPTION" => $res["DETAIL_TEXT"], 
        "SECTION_ID" => $res["IBLOCK_SECTION_ID"]
    );
}
header("Content-Type: application/json");
echo json_encode($data, JSON_UNESCAPED_UNICODE);
?>';

$path = $_SERVER["DOCUMENT_ROOT"]."/get_data.php";
if(file_put_contents($path, $script_content)) {
    echo "ФАЙЛ СОЗДАН! ПЕРЕЙДИТЕ ПО ССЫЛКЕ: <a href='/get_data.php' target='_blank'>vsedlyavanny.kz/get_data.php</a>";
} else {
    echo "ОШИБКА ЗАПИСИ. Проверьте права на папку.";
}
