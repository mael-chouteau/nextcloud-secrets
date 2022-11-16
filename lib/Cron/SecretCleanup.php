<?php
namespace OCA\Secrets\Cron;

use OCA\Secrets\Service\SecretService;
use OCP\BackgroundJob\TimedJob;
use OCP\AppFramework\Utility\ITimeFactory;
use OCP\DB\Exception;

class CleanupExpiredSecrets extends TimedJob {
	private SecretService $service;

	public function __construct(ITimeFactory $time, $service)
	{
		parent::__construct($time);
		$this->service = $service;
		$this->setInterval(24*3600);
	}

	/**
	 * @throws Exception
	 */
	protected function run($argument)
	{
		$this->service->deleteExpired();
	}
}
?>