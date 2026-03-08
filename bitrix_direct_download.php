//title: Direct JSON Download
CModule::IncludeModule("iblock");
$iblock_id = 14; 
$data = array("categories" => array(), "products" => array());

// 1. Категории
$db_sections = CIBlockSection::GetList(array("left_margin" => "asc"), array("IBLOCK_ID" => $iblock_id));
while($sect = $db_sections->GetNext()) {
    $data["categories"][] = array(
        "ID" => $sect["ID"],
        "NAME" => $sect["NAME"],
        "PARENT_ID" => $sect["IBLOCK_SECTION_ID"]
    );
}

// 2. Товары
$db_res = CIBlockElement::GetList(
    array("ID"=>"ASC"), 
    array("IBLOCK_ID" => $iblock_id), 
    false, 
    false, 
    array("ID", "NAME", "DETAIL_PICTURE", "DETAIL_TEXT", "IBLOCK_SECTION_ID")
);

while($res = $db_res->GetNext()) {
    $img_path = CFile::GetPath($res["DETAIL_PICTURE"]);
    $data["products"][] = array(
        "ID" => $res["ID"],
        "NAME" => $res["NAME"],
        "IMAGE" => $img_path ? "https://".$_SERVER["HTTP_HOST"].$img_path : "",
        "DESCRIPTION" => $res["DETAIL_TEXT"],
        "SECTION_ID" => $res["IBLOCK_SECTION_ID"]
    );
}

// 3. Отправляем заголовки для скачивания
$json = json_encode($data, JSON_UNESCAPED_UNICODE);
header('Content-Type: application/json');
header('Content-Disposition: attachment; filename="migration_data.json"');
header('Content-Length: ' . strlen($json));
echo $json;
die();
