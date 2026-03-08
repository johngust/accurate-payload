//title: Full Data Export
CModule::IncludeModule("iblock");

$iblock_id = 14; // Проверьте, что ID верный
$data = array(
    "categories" => array(),
    "products" => array()
);

// 1. Собираем категории
$db_sections = CIBlockSection::GetList(array("left_margin" => "asc"), array("IBLOCK_ID" => $iblock_id));
while($sect = $db_sections->GetNext()) {
    $data["categories"][] = array(
        "ID" => $sect["ID"],
        "NAME" => $sect["NAME"],
        "PARENT_ID" => $sect["IBLOCK_SECTION_ID"]
    );
}

// 2. Собираем все товары (без лимита)
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

// 3. Сохраняем в файл в корень сайта
$json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$file_path = $_SERVER["DOCUMENT_ROOT"]."/migration_all_data.json";
file_put_contents($file_path, $json);

echo "ЭКСПОРТ ЗАВЕРШЕН!<br>";
echo "Всего товаров: " . count($data["products"]) . "<br>";
echo "Всего категорий: " . count($data["categories"]) . "<br>";
echo "СКАЧАЙТЕ ФАЙЛ ТУТ: <a href='/migration_all_data.json' target='_blank'>/migration_all_data.json</a>";
