<?php

declare(strict_types=1);

namespace Infrangible\CatalogProductOptionComposite\Setup;

use Magento\Framework\DB\Ddl\Table;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\SchemaSetupInterface;
use Magento\Framework\Setup\UpgradeSchemaInterface;

/**
 * @author      Andreas Knollmann
 * @copyright   2014-2025 Softwareentwicklung Andreas Knollmann
 * @license     http://www.opensource.org/licenses/mit-license.php MIT
 */
class UpgradeSchema implements UpgradeSchemaInterface
{
    public function upgrade(SchemaSetupInterface $setup, ModuleContextInterface $context): void
    {
        $setup->startSetup();

        $connection = $setup->getConnection();

        if (version_compare(
            $context->getVersion(),
            '1.3.0',
            '<'
        )) {
            $catalogProductOptionTableName = $setup->getTable('catalog_product_option');

            if (! $connection->tableColumnExists(
                $catalogProductOptionTableName,
                'allow_product_ids'
            )) {
                $connection->addColumn(
                    $catalogProductOptionTableName,
                    'allow_product_ids',
                    [
                        'type'     => Table::TYPE_TEXT,
                        'length'   => 10000,
                        'nullable' => true,
                        'comment'  => 'Allow Product Ids'
                    ]
                );
            }

            if (! $connection->tableColumnExists(
                $catalogProductOptionTableName,
                'allow_hide_product_ids'
            )) {
                $connection->addColumn(
                    $catalogProductOptionTableName,
                    'allow_hide_product_ids',
                    [
                        'type'     => Table::TYPE_TEXT,
                        'length'   => 10000,
                        'nullable' => true,
                        'comment'  => 'Allow & Hide Product Ids'
                    ]
                );
            }

            if (! $connection->tableColumnExists(
                $catalogProductOptionTableName,
                'prohibit_product_ids'
            )) {
                $connection->addColumn(
                    $catalogProductOptionTableName,
                    'prohibit_product_ids',
                    [
                        'type'     => Table::TYPE_TEXT,
                        'length'   => 10000,
                        'nullable' => true,
                        'comment'  => 'Prohibit Product Ids'
                    ]
                );
            }

            if (! $connection->tableColumnExists(
                $catalogProductOptionTableName,
                'prohibit_hide_product_ids'
            )) {
                $connection->addColumn(
                    $catalogProductOptionTableName,
                    'prohibit_hide_product_ids',
                    [
                        'type'     => Table::TYPE_TEXT,
                        'length'   => 10000,
                        'nullable' => true,
                        'comment'  => 'Prohibit & Hide Product Ids'
                    ]
                );
            }
        }

        $setup->endSetup();
    }
}
